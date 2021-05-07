"use strict";

import bridge from "../lib/bridge";
import logger from "../lib/logger";
import { TypedEventTarget } from "../lib/TypedEventTarget";

import { Message, Port } from "../messaging";
import { ReceiverDevice } from "../types";
import { ReceiverStatus } from "../cast/sdk/types";


interface EventMap {
    "receiverDeviceUp": { receiverDevice: ReceiverDevice }
  , "receiverDeviceDown": { receiverDeviceId: string }
  , "receiverDeviceUpdated": {
        receiverDeviceId: string
      , status: ReceiverStatus
    }
}

export default new class extends TypedEventTarget<EventMap> {
    /**
     * Map of receiver device IDs to devices. Updated as
     * receiverDevice messages are received from the bridge.
     */
    private receiverDevices = new Map<string, ReceiverDevice>();

    private bridgePort?: Port;


    async init() {
        if (!this.bridgePort) {
            await this.refresh();
        }
    }

    /**
     * Initialize (or re-initialize) a bridge connection to
     * start dispatching events.
     */
    async refresh() {
        this.bridgePort?.disconnect();

        const port = await bridge.connect();

        port.onMessage.addListener(this.onBridgeMessage);
        port.onDisconnect.addListener(this.onBridgeDisconnect);

        port.postMessage({
            subject: "bridge:startDiscovery"
          , data: {
                // Also send back status messages
                shouldWatchStatus: true
            }
        });

        this.bridgePort = port;
    }

    /**
     * Get a list of receiver devices
     */
    getDevices() {
        return Array.from(this.receiverDevices.values());
    }

    /**
     * Stops a receiver app running on a given device.
     */
    stopReceiverApp(receiverDeviceId: string) {
        if (!this.bridgePort) {
            logger.error("Failed to stop receiver device, no bridge connection");
            return;
        }

        const receiverDevice = this.receiverDevices.get(receiverDeviceId);
        if (receiverDevice) {
            this.bridgePort.postMessage({
                subject: "bridge:stopCastApp"
              , data: { receiverDevice }
            });
        }
    }

    private onBridgeMessage = (message: Message) => {
        switch (message.subject) {
            case "main:receiverDeviceUp": {
                const { receiverDevice } = message.data;

                this.receiverDevices.set(receiverDevice.id, receiverDevice);
                this.dispatchEvent(
                        new CustomEvent("receiverDeviceUp"
                      , {
                            detail: { receiverDevice }
                        }));

                break;
            }

            case "main:receiverDeviceDown": {
                const { receiverDeviceId } = message.data;

                if (this.receiverDevices.has(receiverDeviceId)) {
                    this.receiverDevices.delete(receiverDeviceId);
                }
                this.dispatchEvent(
                        new CustomEvent("receiverDeviceDown"
                      , {
                            detail: { receiverDeviceId }
                        }));

                break;
            }

            case "main:receiverDeviceUpdated": {
                const { receiverDeviceId, status } = message.data;
                const receiverDevice =
                        this.receiverDevices.get(receiverDeviceId);

                if (!receiverDevice) {
                    logger.error(`Receiver ID \`${receiverDeviceId}\` not found!`);
                    break;
                }

                if (receiverDevice.status) {
                    receiverDevice.status.isActiveInput = status.isActiveInput;
                    receiverDevice.status.isStandBy = status.isStandBy;
                    receiverDevice.status.volume = status.volume;

                    if (status.applications) {
                        receiverDevice.status.applications =
                                status.applications;
                    }
                } else {
                    receiverDevice.status = status;
                }

                this.dispatchEvent(
                        new CustomEvent("receiverDeviceUpdated"
                      , {
                            detail: {
                                receiverDeviceId
                              , status: receiverDevice.status
                            }
                        }));
            }
        }
    }

    private onBridgeDisconnect = () => {
        // Notify listeners of device availablility
        for (const [ , receiverDevice ] of this.receiverDevices) {
            const event = new CustomEvent("receiverDeviceDown", {
                detail: { receiverDeviceId: receiverDevice.id }
            });

            this.dispatchEvent(event);
        }

        this.receiverDevices.clear();

        // Re-initialize after 10 seconds
        window.setTimeout(() => {
            this.refresh();
        }, 10000);
    }
};
