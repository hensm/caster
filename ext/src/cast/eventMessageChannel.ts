"use strict";

import { Message } from "../messaging";


type ListenerFunc = (message: Message) => void;

export interface ListenerObject {
    disconnect (): void;
}


export function onMessage(listener: ListenerFunc): ListenerObject {
    function on__castMessage(ev: CustomEvent) {
        listener(JSON.parse(ev.detail));

        /**
         * TODO:
         * Figure out a way to handle and stop propagation of this
         * event to hide it from page scripts.
         * Currently the event handler is set after the page loads the
         * cast API, allowing pages set handlers before this script,
         * intercept the event, and cancel it.
         */
        ev.stopPropagation();
    }

    // @ts-ignore
    document.addEventListener(
            "__castMessage"
          , on__castMessage, true);

    return {
        disconnect() {
            // @ts-ignore
            document.removeEventListener(
                    "__castMessage"
                  , on__castMessage, true);
        }
    };
}

export function sendMessageResponse(message: Message) {
    const event = new CustomEvent("__castMessageResponse", {
        detail: JSON.stringify(message)
    });

    document.dispatchEvent(event);
}


export function onMessageResponse(listener: ListenerFunc): ListenerObject {
    function on__castMessageResponse(ev: CustomEvent) {
        listener(JSON.parse(ev.detail));
    }

    // @ts-ignore
    document.addEventListener(
            "__castMessageResponse"
          , on__castMessageResponse, true);

    return {
        disconnect() {
            // @ts-ignore
            document.removeEventListener(
                    "__castMessageResponse"
                  , on__castMessageResponse, true);
        }
    };
}

export function sendMessage(message: Message) {
    const event = new CustomEvent("__castMessage", {
        detail: JSON.stringify(message)
    });

    document.dispatchEvent(event);
}
