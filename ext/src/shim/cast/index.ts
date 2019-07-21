"use strict";

import ApiConfig from "./classes/ApiConfig";
import DialRequest from "./classes/DialRequest";
import Error_ from "./classes/Error";
import Image_ from "./classes/Image";
import Receiver_ from "./classes/Receiver";
import ReceiverDisplayStatus from "./classes/ReceiverDisplayStatus";
import SenderApplication from "./classes/SenderApplication";
import Session from "./classes/Session";
import SessionRequest from "./classes/SessionRequest";
import Timeout from "./classes/Timeout";
import Volume from "./classes/Volume";

import { AutoJoinPolicy
       , Capability
       , DefaultActionPolicy
       , DialAppState
       , ErrorCode
       , ReceiverAction
       , ReceiverAvailability
       , ReceiverType
       , SenderPlatform
       , SessionStatus
       , VolumeControlType } from "./enums";

import * as media from "./media";


import { ReceiverSelectorMediaType }
    from "../../receiver_selectors/ReceiverSelector";
import { Receiver } from "../../types";
import { onMessage, sendMessageResponse } from "../eventMessageChannel";


type ReceiverActionListener = (
        receiver: Receiver_
      , receiverAction: string) => void;

type RequestSessionSuccessCallback = (session: Session) => void;

type SuccessCallback = () => void;
type ErrorCallback = (err: Error_) => void;


let apiConfig: ApiConfig;
let receiverList: any[] = [];
const sessionList: Session[] = [];
let sessionRequestInProgress = false;

const receiverListeners = new Set<ReceiverActionListener>();

let sessionSuccessCallback: RequestSessionSuccessCallback;
let sessionErrorCallback: ErrorCallback;


export {
    // Enums
    AutoJoinPolicy, Capability, DefaultActionPolicy, DialAppState
  , ErrorCode, ReceiverAction, ReceiverAvailability, ReceiverType
  , SenderPlatform, SessionStatus, VolumeControlType

    // Classes
  , ApiConfig, DialRequest, ReceiverDisplayStatus
  , SenderApplication, Session, SessionRequest, Timeout
  , Volume

  , Error_ as Error
  , Image_ as Image
  , Receiver_ as Receiver

  , media
};

export let isAvailable = false;
export const timeout = new Timeout();
export const VERSION = [1, 2];

export function addReceiverActionListener (
        listener: ReceiverActionListener): void {

    console.info("fx_cast (Debug): cast.addReceiverActionListener");
    receiverListeners.add(listener);
}

export function initialize (
        newApiConfig: ApiConfig
      , successCallback?: SuccessCallback
      , errorCallback?: ErrorCallback): void {

    console.info("fx_cast (Debug): cast.initialize");

    // Already initialized
    if (apiConfig) {
        if (errorCallback) {
            errorCallback(new Error_(ErrorCode.INVALID_PARAMETER));
        }

        return;
    }


    apiConfig = newApiConfig;

    sendMessageResponse({
        subject: "main:/shimInitialized"
    });

    apiConfig.receiverListener(receiverList.length
        ? ReceiverAvailability.AVAILABLE
        : ReceiverAvailability.UNAVAILABLE);

    if (successCallback) {
        successCallback();
    }
}

export function logMessage (message: string): void {
    /* tslint:disable-next-line:no-console */
    console.log("CAST MSG:", message);
}

export function precache (data: string): void {
    console.info("STUB :: cast.precache");
}

export function removeReceiverActionListener (
        listener: ReceiverActionListener): void {

    receiverListeners.delete(listener);
}

export function requestSession (
        successCallback?: RequestSessionSuccessCallback
      , errorCallback?: ErrorCallback
      , sessionRequest: SessionRequest = apiConfig.sessionRequest): void {

    console.info("fx_cast (Debug): cast.requestSession");

    // Called before initialization
    if (!apiConfig) {
        if (errorCallback) {
            errorCallback(new Error_(ErrorCode.API_NOT_INITIALIZED));
        }

        return;
    }

    // Already requesting session
    if (sessionRequestInProgress) {
        if (errorCallback) {
            errorCallback(new Error_(ErrorCode.INVALID_PARAMETER
                  , "Session request already in progress."));
        }

        return;
    }

    // No available receivers
    if (!receiverList.length) {
        if (errorCallback) {
            errorCallback(new Error_(ErrorCode.RECEIVER_UNAVAILABLE));
        }

        return;
    }

    sessionRequestInProgress = true;

    sessionSuccessCallback = successCallback;
    sessionErrorCallback = errorCallback;

    // Open destination chooser
    sendMessageResponse({
        subject: "main:/selectReceiverBegin"
    });
}

export function _requestSession (
        _receiver: Receiver
      , successCallback?: RequestSessionSuccessCallback
      , errorCallback?: ErrorCallback): void {

    console.info("fx_cast (Debug): cast._requestSession");

    if (!apiConfig) {
        if (errorCallback) {
            errorCallback(new Error_(ErrorCode.API_NOT_INITIALIZED));
        }

        return;
    }

    if (sessionRequestInProgress) {
        if (errorCallback) {
            errorCallback(new Error_(ErrorCode.INVALID_PARAMETER
                  , "Session request already in progress."));
        }

        return;
    }

    if (!receiverList.length) {
        if (errorCallback) {
            errorCallback(new Error_(ErrorCode.RECEIVER_UNAVAILABLE));
        }

        return;
    }

    sessionRequestInProgress = true;

    sessionSuccessCallback = successCallback;
    sessionErrorCallback = errorCallback;


    const selectedReceiver = new Receiver_(
            _receiver.id
          , _receiver.friendlyName);

    (selectedReceiver as any)._address = _receiver.host;
    (selectedReceiver as any)._port = _receiver.port;

    function createSession () {
        sessionList.push(new Session(
                sessionList.length.toString()  // sessionId
              , apiConfig.sessionRequest.appId // appId
              , _receiver.friendlyName         // displayName
              , []                             // appImages
              , selectedReceiver               // receiver
              , (session: Session) => {
                    sendMessageResponse({
                        subject: "main:/sessionCreated"
                    });

                    sessionRequestInProgress = false;

                    if (sessionSuccessCallback) {
                        sessionSuccessCallback(session);
                    }
                }));
    }

    // If an existing session is active, stop it and start new one
    if (sessionList.length) {
        const lastSession = sessionList[sessionList.length - 1];

        if (lastSession.status !== SessionStatus.STOPPED) {
            lastSession.stop(createSession, null);
        }
    } else {
        createSession();
    }
}

export function requestSessionById (sessionId: string): void {
    console.info("STUB :: cast.requestSessionById");
}

export function setCustomReceivers (
        receivers: Receiver_[]
      , successCallback?: SuccessCallback
      , errorCallback?: ErrorCallback): void {

    console.info("STUB :: cast.setCustomReceivers");
}

export function setPageContext (win: Window): void {
    console.info("STUB :: cast.setPageContext");
}

export function setReceiverDisplayStatus (sessionId: string): void {
    console.info("STUB :: cast.setReceiverDisplayStatus");
}

export function unescape (escaped: string): string {
    return decodeURI(escaped);
}


onMessage(async message => {
    switch (message.subject) {
        case "shim:/initialized": {
            isAvailable = true;
            break;
        }

        /**
         * Cast destination found (serviceUp). Set the API availability
         * property and call the page event function (__onGCastApiAvailable).
         */
        case "shim:/serviceUp": {
            const receiver = message.data;

            if (receiverList.find(r => r.id === receiver.id)) {
                break;
            }

            receiverList.push(receiver);

            if (apiConfig) {
                // Notify listeners of new cast destination
                apiConfig.receiverListener(ReceiverAvailability.AVAILABLE);
            }

            break;
        }

        /**
         * Cast destination lost (serviceDown). Remove from the receiver list
         * and update availability state.
         */
        case "shim:/serviceDown": {
            receiverList = receiverList.filter(
                    receiver => receiver.id !== message.data.id);

            if (receiverList.length === 0) {
                if (apiConfig) {
                    apiConfig.receiverListener(
                            ReceiverAvailability.UNAVAILABLE);
                }
            }

            break;
        }

        case "shim:/selectReceiverEnd": {
            console.info("fx_cast (Debug): Selected receiver");

            const selectedReceiver = new Receiver_(
                    message.data.receiver.id
                  , message.data.receiver.friendlyName);

            (selectedReceiver as any)._address = message.data.receiver.host;
            (selectedReceiver as any)._port = message.data.receiver.port;

            function createSession () {
                sessionList.push(new Session(
                        sessionList.length.toString()  // sessionId
                      , apiConfig.sessionRequest.appId // appId
                      , selectedReceiver.friendlyName  // displayName
                      , []                             // appImages
                      , selectedReceiver               // receiver
                      , (session: Session) => {
                            sendMessageResponse({
                                subject: "main:/sessionCreated"
                            });

                            sessionRequestInProgress = false;

                            if (sessionSuccessCallback) {
                                sessionSuccessCallback(session);
                            }
                        }));
            }

            // If an existing session is active, stop it and start new one
            if (sessionList.length) {
                const lastSession = sessionList[sessionList.length - 1];

                if (lastSession.status !== SessionStatus.STOPPED) {
                    lastSession.stop(createSession, null);
                }
            } else {
                createSession();
            }

            break;
        }

        /**
         * Popup closed before session established.
         */
        case "shim:/selectReceiverCancelled": {
            if (sessionRequestInProgress) {
                sessionRequestInProgress = false;

                if (sessionErrorCallback) {
                    sessionErrorCallback(new Error_(ErrorCode.CANCEL));
                }
            }

            break;
        }
    }
});
