"use strict";

import options from "../lib/options";
import cast, { ensureInit } from "../shim/export";

import { ReceiverSelectorMediaType }
        from "../receiver_selectors/ReceiverSelector";

import { Receiver } from "../types";


// Variables passed from background
const { selectedMedia
      , selectedReceiver }
    : { selectedMedia: ReceiverSelectorMediaType
      , selectedReceiver: Receiver } = (window as any);


const FX_CAST_RECEIVER_APP_NAMESPACE = "urn:x-cast:fx_cast";


let session: cast.Session;
let wasSessionRequested = false;

let peerConnection: RTCPeerConnection;
let drawWindowIntervalId: number;


let availableMediaTypes =
        ReceiverSelectorMediaType.Screen
      | ReceiverSelectorMediaType.Tab;

/**
 * Remove "Screen" option when on an insecure origin as
 * MediaDevices.getDisplayMedia will not exist (and legacy
 * MediaDevices.getUserMedia mediaSource constraint will
 * fail).
 */
if (typeof navigator.mediaDevices.getDisplayMedia === "undefined") {
    availableMediaTypes &= ~ReceiverSelectorMediaType.Screen;
}


/**
 * Sends a message to the fx_cast app running on the
 * receiver device.
 */
function sendAppMessage (subject: string, data: any) {
    if (!session) {
        return;
    }

    session.sendMessage(FX_CAST_RECEIVER_APP_NAMESPACE, {
        subject
      , data
    }, null, null);
}


window.addEventListener("beforeunload", () => {
    sendAppMessage("close", null);
});


async function onRequestSessionSuccess (newSession: cast.Session) {

    cast.logMessage("onRequestSessionSuccess");

    session = newSession;
    session.addMessageListener(FX_CAST_RECEIVER_APP_NAMESPACE
          , async (namespace, message) => {

        const { subject, data } = JSON.parse(message);

        switch (subject) {
            case "peerConnectionAnswer": {
                peerConnection.setRemoteDescription(data);
                break;
            }
            case "iceCandidate": {
                peerConnection.addIceCandidate(data);
                break;
            }
        }
    });

    peerConnection = new RTCPeerConnection();
    peerConnection.addEventListener("icecandidate", (ev) => {
        sendAppMessage("iceCandidate", ev.candidate);
    });

    switch (selectedMedia) {
        case ReceiverSelectorMediaType.Tab: {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Set initial size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // Resize canvas whenever the window resizes
            window.addEventListener("resize", () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });

            // TODO: Test performance
            const drawFlags =
                    ctx.DRAWWINDOW_DRAW_CARET
                  | ctx.DRAWWINDOW_DRAW_VIEW
                  | ctx.DRAWWINDOW_ASYNC_DECODE_IMAGES;

            /**
             * Clears the canvas and draws the window. Called repeatedly,
             * currently at 30FPS rate because performance is quite poor.
             */
            function drawWindow () {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawWindow(
                        window        // window
                      , 0, 0          // x, y
                      , canvas.width  // w
                      , canvas.height // h
                      , "white"       // bgColor
                      , drawFlags);   // flags
            }


            drawWindowIntervalId = window.setInterval(drawWindow, 1000 / 30);

            /**
             * Capture video stream from canvas and feed into the RTC
             * connection.
             */
            peerConnection.addStream(canvas.captureStream());

            break;
        }

        case ReceiverSelectorMediaType.Screen: {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: "motion" }
              , audio: false
            });

            peerConnection.addStream(stream);

            break;
        }
    }

    // Create SDP offer and set locally
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // Send local offer to receiver app
    sendAppMessage("peerConnectionOffer", offer);
}


function receiverListener (availability: string) {
    cast.logMessage("receiverListener");

    if (wasSessionRequested) {
        return;
    }

    if (availability === cast.ReceiverAvailability.AVAILABLE) {
        wasSessionRequested = true;
        cast._requestSession(
                selectedReceiver
              , onRequestSessionSuccess
              , onRequestSessionError);
    }
}


function onRequestSessionError () {
    cast.logMessage("onRequestSessionError");
}
function sessionListener () {
    cast.logMessage("sessionListener");
}
function onInitializeSuccess () {
    cast.logMessage("onInitializeSuccess");
}
function onInitializeError () {
    cast.logMessage("onInitializeError");
}


ensureInit().then(async () => {
    const mirroringAppId = await options.get("mirroringAppId");
    const sessionRequest = new cast.SessionRequest(mirroringAppId);

    const apiConfig = new cast.ApiConfig(
            sessionRequest
          , sessionListener
          , receiverListener
          , undefined, undefined);

    cast.initialize(apiConfig
          , onInitializeSuccess
          , onInitializeError);
});
