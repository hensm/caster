"use strict";

import options from "../lib/options";
import cast, { ensureInit } from "../cast/export";

import { ReceiverSelectorMediaType } from "../background/receiverSelector";
import { ReceiverDevice } from "../types";


// Variables passed from background
const { selectedMedia
      , selectedReceiver }
    : { selectedMedia: ReceiverSelectorMediaType
      , selectedReceiver: ReceiverDevice } = (window as any);


const FX_CAST_RECEIVER_APP_NAMESPACE = "urn:x-cast:fx_cast";


let session: cast.Session;
let wasSessionRequested = false;

let peerConnection: RTCPeerConnection;


/**
 * Sends a message to the fx_cast app running on the
 * receiver device.
 */
function sendAppMessage(subject: string, data: any) {
    if (!session) {
        return;
    }

    session.sendMessage(FX_CAST_RECEIVER_APP_NAMESPACE, {
        subject
      , data
    });
}


window.addEventListener("beforeunload", () => {
    sendAppMessage("close", null);
});


async function onRequestSessionSuccess(newSession: cast.Session) {
    cast.logMessage("onRequestSessionSuccess");

    session = newSession;
    session.addMessageListener(FX_CAST_RECEIVER_APP_NAMESPACE
          , async (_namespace, message) => {

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

            // Shouldn't be possible
            if (!ctx) {
                break;
            }

            // Set initial size
            canvas.width = window.innerWidth * window.devicePixelRatio;
            canvas.height = window.innerHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

            // Resize canvas whenever the window resizes
            window.addEventListener("resize", () => {
                canvas.width = window.innerWidth * window.devicePixelRatio;
                canvas.height = window.innerHeight * window.devicePixelRatio;
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            });

            // TODO: Test performance
            const drawFlags =
                    ctx.DRAWWINDOW_DRAW_CARET
                  | ctx.DRAWWINDOW_DRAW_VIEW
                  | ctx.DRAWWINDOW_ASYNC_DECODE_IMAGES
                  | ctx.DRAWWINDOW_USE_WIDGET_LAYERS;

            let lastFrame: DOMHighResTimeStamp;
            window.requestAnimationFrame(
                    function draw(now: DOMHighResTimeStamp) {

                if (!lastFrame) {
                    lastFrame = now;
                }

                if ((now - lastFrame) > (1000 / 30)) {
                    ctx.drawWindow(
                            window        // window
                          , 0, 0          // x, y
                          , canvas.width  // w
                          , canvas.height // h
                          , "white"       // bgColor
                          , drawFlags);   // flags

                    lastFrame = now;
                }

                window.requestAnimationFrame(draw);
            });

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


function receiverListener(availability: string) {
    cast.logMessage("receiverListener");

    if (wasSessionRequested) {
        return;
    }

    if (availability === cast.ReceiverAvailability.AVAILABLE) {
        wasSessionRequested = true;
        cast.requestSession(onRequestSessionSuccess
                          , onRequestSessionError
                          , undefined
                          , selectedReceiver);
    }
}


function onRequestSessionError() {
    cast.logMessage("onRequestSessionError");
}
function sessionListener() {
    cast.logMessage("sessionListener");
}
function onInitializeSuccess() {
    cast.logMessage("onInitializeSuccess");
}
function onInitializeError() {
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
