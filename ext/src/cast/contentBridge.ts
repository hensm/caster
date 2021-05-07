"use strict";

import { loadScript } from "../lib/utils";
import { onMessageResponse, sendMessage } from "./eventMessageChannel";

import messaging, { Message } from "../messaging";


// Message port to background script
export const backgroundPort = messaging.connect({ name: "shim" });

const forwardToShim = (message: Message) => sendMessage(message);
const forwardToMain = (message: Message) => backgroundPort.postMessage(message);

// Add message listeners
backgroundPort.onMessage.addListener(forwardToShim);
const listener = onMessageResponse(forwardToMain);

// Remove listeners
backgroundPort.onDisconnect.addListener(() => {
    backgroundPort.onMessage.removeListener(forwardToShim);
    listener.disconnect();
});
