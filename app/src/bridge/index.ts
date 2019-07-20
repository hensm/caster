import dnssd from "dnssd";

import child_process from "child_process";
import events from "events";
import fs from "fs";
import http from "http";
import mime from "mime-types";
import path from "path";

import Media from "./Media";
import MediaServer from "./MediaServer";
import Session from "./Session";
import StatusListener from "./StatusListener";

import { DecodeTransform
       , EncodeTransform
       , ResponseTransform } from "../transforms";

import { MediaStatus
       , ReceiverStatus } from "./castTypes";

import { Message } from "./types";

import { __applicationName
       , __applicationVersion } from "../../package.json";


// Increase listener limit
events.EventEmitter.defaultMaxListeners = 50;


const browser = new dnssd.Browser(dnssd.tcp("googlecast"));

// Local media server
let mediaServer: MediaServer;

process.on("SIGTERM", () => {
    if (mediaServer) {
        mediaServer.stop();
    }
});


const decodeTransform = new DecodeTransform();
const encodeTransform = new EncodeTransform();

// stdin -> stdout
process.stdin
    .pipe(decodeTransform)
    .pipe(new ResponseTransform(handleMessage))
    .pipe(encodeTransform)
    .pipe(process.stdout);

/**
 * Encode and send a message to the extension.
 */
function sendMessage (message: object) {
    try {
        encodeTransform.write(message);
    } catch (err) {
        console.error("Failed to encode message", err);
    }
}


interface InitializeOptions {
    shouldWatchStatus?: boolean;
}

// Existing counterpart Media/Session objects
const existingSessions: Map<string, Session> = new Map();
const existingMedia: Map<string, Media> = new Map();

let receiverSelectorApp: child_process.ChildProcess;
let receiverSelectorAppClosed = true;

/**
 * Handle incoming messages from the extension and forward
 * them to the appropriate handlers.
 *
 * Initializes the counterpart objects and is responsible
 * for managing existing ones.
 */
async function handleMessage (message: Message) {
    if (message.subject.startsWith("bridge:/media/")) {
        const mediaId = message._id!;

        if (existingMedia.has(mediaId)) {
            // Forward message to instance message handler
            existingMedia.get(mediaId)!.messageHandler(message);
        } else {
            if (message.subject.endsWith("/initialize")) {
                // Get Session object media belongs to
                const parentSession = existingSessions.get(
                        message.data._internalSessionId);

                if (parentSession) {
                    // Create Media
                    existingMedia.set(mediaId, new Media(
                            message.data.sessionId
                          , message.data.mediaSessionId
                          , mediaId
                          , parentSession
                          , sendMessage));
                }
            }
        }

        return;
    }

    if (message.subject.startsWith("bridge:/session/")) {
        const sessionId = message._id!;

        if (existingSessions.has(sessionId)) {
            // Forward message to instance message handler
            existingSessions.get(sessionId)!.messageHandler(message);
        } else {
            if (message.subject.endsWith("/initialize")) {
                // Create Session
                existingSessions.set(sessionId, new Session(
                        message.data.address
                      , message.data.port
                      , message.data.appId
                      , message.data.sessionId
                      , sessionId
                      , sendMessage));
            }
        }

        return;
    }

    switch (message.subject) {
        case "bridge:/getInfo": {
            const extensionVersion = message.data;
            return __applicationVersion;
        }

        case "bridge:/initialize": {
            const options: InitializeOptions = message.data;
            initialize(options);

            break;
        }


        case "bridge:/receiverSelector/open": {
            const receiverSelectorData = message.data;

            if (process.platform !== "darwin") {
                console.error("Invalid platform for native selector.");
                process.exit(1);
            }

            if (!receiverSelectorData) {
                console.error("Missing native selector data.");
                process.exit(1);
            } else {
                try {
                    JSON.parse(receiverSelectorData);
                } catch (err) {
                    console.error("Invalid native selector data.");
                }
            }

            receiverSelectorApp = child_process.spawn(
                    path.join(process.cwd(), "selector")
                  , [ receiverSelectorData ]);

            receiverSelectorAppClosed = false;

            receiverSelectorApp.stdout!.setEncoding("utf8");
            receiverSelectorApp.stdout!.on("data", data => {
                sendMessage({
                    subject: "main:/receiverSelector/selected"
                  , data: JSON.parse(data)
                });
            });

            receiverSelectorApp.on("error", err => {
                sendMessage({
                    subject: "main:/receiverSelector/error"
                  , data: err.message
                });
            });

            receiverSelectorApp.on("close", () => {
                if (!receiverSelectorAppClosed) {
                    receiverSelectorAppClosed = true;

                    sendMessage({
                        subject: "main:/receiverSelector/close"
                    });
                }
            });

            break;
        }

        case "bridge:/receiverSelector/close": {
            receiverSelectorApp.kill();
            receiverSelectorAppClosed = true;

            break;
        }


        case "bridge:/mediaServer/start": {
            const { filePath, port } = message.data;

            mediaServer = new MediaServer(filePath, port);
            mediaServer.start();

            mediaServer.on("started", () => {
                sendMessage({
                    subject: "mediaCast:/mediaServer/started"
                });
            });

            mediaServer.on("stopped", () => {
                sendMessage({
                    subject: "mediaCast:/mediaServer/stopped"
                });
            });

            break;
        }

        case "bridge:/mediaServer/stop": {
            if (mediaServer) {
                mediaServer.stop();
            }

            break;
        }
    }
}


function initialize (options: InitializeOptions) {
    if (options.shouldWatchStatus) {
        browser.on("serviceUp", onStatusBrowserServiceUp);
        browser.on("serviceDown", onStatusBrowserServiceDown);
    }

    browser.on("serviceUp", onBrowserServiceUp);
    browser.on("servicedown", onBrowserServiceDown);
    browser.start();


    function onBrowserServiceUp (service: dnssd.Service) {
        sendMessage({
            subject: "shim:/serviceUp"
          , data: {
                host: service.addresses[0]
              , port: service.port
              , id: service.txt.id
              , friendlyName: service.txt.fn
            }
        });
    }

    function onBrowserServiceDown (service: dnssd.Service) {
        sendMessage({
            subject: "shim:/serviceDown"
          , data: {
                id: service.txt.id
            }
        });
    }


    // Receiver status listeners for status mode
    const statusListeners = new Map<string, StatusListener>();

    function onStatusBrowserServiceUp (service: dnssd.Service) {
        const { id } = service.txt;

        const listener = new StatusListener(
                service.addresses[0]
              , service.port);

        listener.on("receiverStatus", (status: ReceiverStatus) => {
            const receiverStatusMessage: any = {
                subject: "receiverStatus"
              , data: {
                    id
                  , status: {
                        volume: {
                            level: status.volume.level
                          , muted: status.volume.muted
                        }
                    }
                }
            };

            if (status.applications && status.applications.length) {
                const application = status.applications[0];

                receiverStatusMessage.data.status.application = {
                    displayName: application.displayName
                  , isIdleScreen: application.isIdleScreen
                  , statusText: application.statusText
                };
            }

            sendMessage(receiverStatusMessage);
        });

        statusListeners.set(id, listener);
    }

    function onStatusBrowserServiceDown (service: dnssd.Service) {
        const { id } = service.txt;

        if (statusListeners.has(id)) {
            statusListeners.get(id)!.deregister();
            statusListeners.delete(id);
        }
    }
}
