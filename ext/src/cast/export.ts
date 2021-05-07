"use strict";

import * as cast from "./sdk";
import { Message } from "../messaging";

import { BridgeInfo } from "../lib/bridge";
import { TypedMessagePort } from "../lib/TypedMessagePort";

import { onMessage
       , onMessageResponse
       , sendMessage } from "./eventMessageChannel";


let initializedBridgeInfo: BridgeInfo;
let initializedBackgroundPort: MessagePort;

/**
 * To support exporting an API from a module, we need to
 * retain the event-based message passing despite not
 * actually crossing any context boundaries. The shim listens
 * for and emits these messages, and changing that behavior
 * is too messy.
 */
export function ensureInit(): Promise<TypedMessagePort<Message>> {
    return new Promise(async (resolve, reject) => {

        // If already initialized, just return existing bridge info
        if (initializedBridgeInfo) {
            if (initializedBridgeInfo.isVersionCompatible) {
                resolve(initializedBackgroundPort);
            } else {
                reject();
            }

            return;
        }

        const channel = new MessageChannel();
        initializedBackgroundPort = channel.port1;

        /**
         * If the module is imported into a background script
         * context, the location will be the internal extension URL,
         * whereas in a content script, it will be the content page
         * URL.
         */
        if (window.location.protocol === "moz-extension:") {
            const { default: ShimManager } =
                    await import("../background/ShimManager");

            // port2 will post bridge messages to port 1
            await ShimManager.init();
            await ShimManager.createShim(channel.port2);

            // bridge -> shim
            channel.port1.onmessage = ev => {
                const message = ev.data as Message;

                // Send message to shim
                sendMessage(message);
                handleIncomingMessageToShim(message);
            };

            // shim -> bridge
            onMessageResponse(message => {
                channel.port1.postMessage(message);
            });
        } else {
            /**
             * Import reference to message port created by contentBridge.
             * Creation of the port triggers side-effects in the
             * background script.
             */
            const { backgroundPort } = await import("./contentBridge");

            // backgroundPort -> channel.port2
            backgroundPort.onMessage.addListener((message: Message) => {
                channel.port2.postMessage(message);
            });

            // channel.port2 -> backgroundPort
            channel.port2.onmessage = ev => {
                const message = ev.data as Message;
                backgroundPort.postMessage(message);
            };

            // Handle shim messages
            onMessage(handleIncomingMessageToShim);
        }

        function handleIncomingMessageToShim(message: Message) {
            switch (message.subject) {
                case "shim:initialized": {
                    initializedBridgeInfo = message.data;

                    if (initializedBridgeInfo.isVersionCompatible) {
                        resolve(initializedBackgroundPort);
                    } else {
                        reject();
                    }
                }
            }
        }
    });
}

export default cast;
