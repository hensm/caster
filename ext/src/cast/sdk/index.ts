"use strict";

import logger from "../../lib/logger";

import { ReceiverDevice } from "../../types";
import { ErrorCallback, SuccessCallback } from "../types";

import { onMessage, sendMessageResponse } from "../eventMessageChannel";

import { AutoJoinPolicy, Capability, DefaultActionPolicy, DialAppState
      , ErrorCode, ReceiverAction, ReceiverAvailability, ReceiverType
      , SenderPlatform, SessionStatus, VolumeControlType } from "./enums";

import { ApiConfig, CredentialsData, DialRequest, Error as Error_, Image
       , Receiver, ReceiverDisplayStatus, SenderApplication, SessionRequest
       , Timeout, Volume } from "./dataClasses";

import Session from "./Session";


type ReceiverActionListener = (
    receiver: Receiver
  , receiverAction: string) => void;

type RequestSessionSuccessCallback = (session: Session) => void;


let apiConfig: Nullable<ApiConfig>;
let sessionRequest: Nullable<SessionRequest>;

let requestSessionSuccessCallback: Nullable<
        RequestSessionSuccessCallback>;
let requestSessionErrorCallback: Nullable<ErrorCallback>;

const receiverActionListeners = new Set<ReceiverActionListener>();

const receiverDevices = new Map<string, ReceiverDevice>();
const sessions = new Map<string, Session>();


export { AutoJoinPolicy, Capability, DefaultActionPolicy, DialAppState
       , ErrorCode, ReceiverAction, ReceiverAvailability, ReceiverType
       , SenderPlatform, SessionStatus, VolumeControlType };

export { ApiConfig, CredentialsData, DialRequest, Error_ as Error, Image
       , Receiver, ReceiverDisplayStatus, SenderApplication, SessionRequest
       , Timeout, Volume, Session };

export const VERSION = [ 1, 2 ];
export let isAvailable = false;

export const timeout = new Timeout();

// chrome.cast.media namespace
export * as media from "./media";


function sendSessionRequest(sessionRequest: SessionRequest
                          , receiverDevice: ReceiverDevice) {

    for (const listener of receiverActionListeners) {
        const receiver = new Receiver(
                receiverDevice.id
              , receiverDevice.friendlyName);

        listener(receiver, ReceiverAction.CAST);
    }

    sendMessageResponse({
        subject: "bridge:createCastSession"
      , data: {
            appId: sessionRequest.appId
          , receiverDevice: receiverDevice
        }
    });
}

export function initialize(newApiConfig: ApiConfig
                         , successCallback?: SuccessCallback
                         , errorCallback?: ErrorCallback) {

    logger.info("cast.initialize");

    // Already initialized
    if (apiConfig) {
        errorCallback?.(new Error_(ErrorCode.INVALID_PARAMETER));
        return;
    }

    apiConfig = newApiConfig;

    sendMessageResponse({
        subject: "main:shimReady"
      , data: { appId: apiConfig.sessionRequest.appId }
    });

    successCallback?.();

    apiConfig.receiverListener(receiverDevices.size
        ? ReceiverAvailability.AVAILABLE
        : ReceiverAvailability.UNAVAILABLE);
}

export function requestSession(successCallback: RequestSessionSuccessCallback
                             , errorCallback: ErrorCallback
                             , newSessionRequest?: SessionRequest
                             , receiverDevice?: ReceiverDevice) {

    logger.info("cast.requestSession");

    // Not yet initialized
    if (!apiConfig) {
        errorCallback?.(new Error_(ErrorCode.API_NOT_INITIALIZED));
        return;
    }

    // Already requesting session
    if (sessionRequest) {
        errorCallback?.(new Error_(
                ErrorCode.INVALID_PARAMETER
            , "Session request already in progress."));
        return;
    }

    // No receivers available
    if (!receiverDevices.size) {
        errorCallback?.(new Error_(ErrorCode.RECEIVER_UNAVAILABLE));
        return;
    }

    /**
     * Store session request for use in return message from
     * receiver selection.
     */
    sessionRequest = newSessionRequest ?? apiConfig.sessionRequest;

    requestSessionSuccessCallback = successCallback;
    requestSessionErrorCallback = errorCallback;

    /**
     * If a receiver was provided, skip the receiver selector
     * process.
     */
    if (receiverDevice) {
        if (receiverDevice?.id && receiverDevices.has(receiverDevice.id)) {
            sendSessionRequest(sessionRequest, receiverDevice);
        }
    } else {
        // Open receiver selector UI
        sendMessageResponse({
            subject: "main:selectReceiver"
        });
    }
}

export function requestSessionById(_sessionId: string): void {
    logger.info("STUB :: cast.requestSessionById");
}

export function setCustomReceivers(_receivers: Receiver[]
                                 , _successCallback?: SuccessCallback
                                 , _errorCallback?: ErrorCallback): void {
    logger.info("STUB :: cast.setCustomReceivers");
}

export function setPageContext(_win: Window): void {
    logger.info("STUB :: cast.setPageContext");
}

export function setReceiverDisplayStatus(_sessionId: string): void {
    logger.info("STUB :: cast.setReceiverDisplayStatus");
}

export function unescape(escaped: string): string {
    return window.decodeURI(escaped);
}

export function addReceiverActionListener(listener: ReceiverActionListener) {
    receiverActionListeners.add(listener);
}
export function removeReceiverActionListener(listener: ReceiverActionListener) {
    receiverActionListeners.delete(listener);
}

export function logMessage(message: string) {
    logger.info("cast.logMessage", message);
}

export function precache(_data: string) {
    logger.info("STUB :: cast.precache");
}


onMessage(message => {
    switch (message.subject) {
        case "shim:initialized": {
            isAvailable = true;
            break;
        }

        /**
         * Once the bridge detects a session creation, session info
         * and data needed to create cast API objects is sent.
         */
        case "shim:castSessionCreated": {
            // Notify background to close UI
            sendMessageResponse({
                subject: "main:sessionCreated"
            });

            const status = message.data;

            // TODO: Implement persistent per-origin receiver IDs
            const receiver = new Receiver(
                    status.receiverFriendlyName  // label
                , status.receiverFriendlyName  // friendlyName
                , [ Capability.VIDEO_OUT
                    , Capability.AUDIO_OUT ]     // capabilities
                , status.volume);              // volume

            const session = new Session(
                    status.sessionId    // sessionId
                , status.appId        // appId
                , status.displayName  // displayName
                , status.appImages    // appImages
                , receiver);          // receiver

            session.senderApps = status.senderApps;
            session.transportId = status.transportId;

            sessions.set(session.sessionId, session);
        }
        // eslint-disable-next-line no-fallthrough
        case "shim:castSessionUpdated": {
            const status = message.data;
            const session = sessions.get(status.sessionId);
            if (!session) {
                logger.error(`Session not found (${status.sessionId})`);
                return;
            }

            session.statusText = status.statusText;
            session.namespaces = status.namespaces;
            session.receiver.volume = status.volume;

            if (requestSessionSuccessCallback) {
                requestSessionSuccessCallback(session);
                requestSessionSuccessCallback = null;
                requestSessionErrorCallback = null;
            }

            break;
        }

        case "shim:castSessionStopped": {
            const { sessionId } = message.data;
            const session = sessions.get(sessionId);
            if (session) {
                session.status = SessionStatus.STOPPED;

                for (const listener of session?._updateListeners) {
                    listener(false);
                }
            }

            break;
        }

        case "shim:receivedCastSessionMessage": {
            const { sessionId, namespace, messageData } = message.data;
            const session = sessions.get(sessionId);
            if (session) {
                const _messageListeners = session._messageListeners;
                const listeners = _messageListeners.get(namespace);

                if (listeners) {
                    for (const listener of listeners) {
                        listener(namespace, messageData);
                    }
                }
            }

            break;
        }

        case "shim:impl_sendCastMessage": {
            const { sessionId, messageId, error } = message.data;

            const session = sessions.get(sessionId);
            if (!session) {
                break;
            }

            const callbacks = session._sendMessageCallbacks.get(messageId);
            if (callbacks) {
                const [ successCallback, errorCallback ] = callbacks;
                
                if (error) {
                    errorCallback?.(new Error_(error));
                    return;
                }

                successCallback?.();
            }

            break;
        }

        case "shim:serviceUp": {
            const { receiverDevice } = message.data;
            if (receiverDevices.has(receiverDevice.id)) {
                break;
            }

            receiverDevices.set(receiverDevice.id, receiverDevice);

            if (apiConfig) {
                // Notify listeners of new cast destination
                apiConfig.receiverListener(
                        ReceiverAvailability.AVAILABLE);
            }

            break;
        }

        case "shim:serviceDown": {
            const { receiverDeviceId } = message.data;

            receiverDevices.delete(receiverDeviceId);

            if (receiverDevices.size === 0) {
                if (apiConfig) {
                    apiConfig.receiverListener(
                            ReceiverAvailability.UNAVAILABLE);
                }
            }

            break;
        }

        case "shim:selectReceiver/selected": {
            logger.info("Selected receiver");

            if (!sessionRequest) {
                break;
            }

            sendSessionRequest(sessionRequest, message.data.receiver);
            break;
        }

        case "shim:selectReceiver/stopped": {
            const { receiver } = message.data;

            logger.info("Stopped receiver");

            if (sessionRequest) {
                sessionRequest = null;

                for (const listener of receiverActionListeners) {
                    const castReceiver = new Receiver(
                            receiver.id
                          , receiver.friendlyName);

                    listener(castReceiver, ReceiverAction.STOP);
                }
            }

            break;
        }

        /**
         * Popup closed before session established.
         */
        case "shim:selectReceiver/cancelled": {
            if (sessionRequest) {
                sessionRequest = null;

                requestSessionErrorCallback?.(
                        new Error_(ErrorCode.CANCEL));
            }

            break;
        }
    }
});

