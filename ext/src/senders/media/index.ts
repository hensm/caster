"use strict";

import logger from "../../lib/logger";
import options from "../../lib/options";
import cast, { ensureInit } from "../../cast/export";

import { Message } from "../../messaging";
import { ReceiverDevice } from "../../types";


function startMediaServer(filePath: string, port: number)
        : Promise<{ mediaPath: string
                  , subtitlePaths: string[]
                  , localAddress: string }> {

    return new Promise((resolve, reject) => {
        backgroundPort.postMessage({
            subject: "bridge:startMediaServer"
          , data: {
                filePath: decodeURI(filePath)
              , port
            }
        } as Message);

        backgroundPort.addEventListener("message", function onMessage(ev) {
            const message = ev.data as Message;

            if (message.subject.startsWith("mediaCast:mediaServer")) {
                backgroundPort.removeEventListener("message", onMessage);
            }

            switch (message.subject) {
                case "mediaCast:mediaServerStarted": {
                    resolve(message.data);
                    break;
                }
                case "mediaCast:mediaServerError": {
                    reject();
                    break;
                }
            }
        });

        backgroundPort.start();
    });
}


let backgroundPort: MessagePort;

let currentSession: cast.Session;
let currentMedia: cast.media.Media;

let mediaElement: HTMLMediaElement;


function getSession(opts: InitOptions): Promise<cast.Session> {
    return new Promise(async (resolve, reject) => {
        /**
         * If a receiver is available, call requestSession. If a
         * specific receiver was specified, bypass receiver selector
         * and create session directly.
         */
        function receiverListener(availability: string) {
            if (availability === cast.ReceiverAvailability.AVAILABLE) {
                cast.requestSession(
                        onRequestSessionSuccess
                      , onRequestSessionError
                      , undefined
                      , opts.receiver);
            }
        }

        function sessionListener() {
            // TODO: Handle this
        }

        function onRequestSessionSuccess(session: cast.Session) {
            resolve(session);
        }
        function onRequestSessionError(err: cast.Error) {
            reject(err.description);
        }


        const sessionRequest = new cast.SessionRequest(
                cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);

        const apiConfig = new cast.ApiConfig(
                sessionRequest
              , sessionListener    // sessionListener
              , receiverListener); // receiverListener


        cast.initialize(apiConfig);
    });
}

function getMedia(opts: InitOptions): Promise<cast.media.Media> {
    return new Promise(async (resolve, reject) => {
        let mediaUrl = new URL(opts.mediaUrl);
        let subtitleUrls: URL[] = [];

        const mediaTitle = mediaUrl.pathname.slice(1);

        /**
         * If the media is a local file, start an HTTP media server
         * and change the media URL to point to it.
         */
        if (opts.mediaUrl.startsWith("file://")) {
            const port = await options.get("localMediaServerPort");

            try {
                // Wait until media server is listening
                const { localAddress, mediaPath, subtitlePaths } =
                        await startMediaServer(mediaTitle, port);

                const baseUrl = new URL(`http://${localAddress}:${port}/`);
                mediaUrl = new URL(mediaPath, baseUrl);
                subtitleUrls = subtitlePaths.map(
                        path => new URL(path, baseUrl));

            } catch (err) {
                throw logger.error("Failed to start media server");
            }
        }


        const activeTrackIds: number[] = [];
        const mediaInfo = new cast.media.MediaInfo(mediaUrl.href, "");

        mediaInfo.metadata = new cast.media.GenericMediaMetadata();
        mediaInfo.metadata.metadataType = cast.media.MetadataType.GENERIC;
        mediaInfo.metadata.title = mediaTitle;
        mediaInfo.tracks = [];

        let trackIndex = 0;
        for (const subtitleUrl of subtitleUrls) {
            const castTrack = new cast.media.Track(
                    trackIndex, cast.media.TrackType.TEXT);

            castTrack.name = subtitleUrl.pathname;
            castTrack.trackContentId = subtitleUrl.href;
            castTrack.trackContentType = "text/vtt";
            castTrack.subtype = cast.media.TextTrackType.SUBTITLES;

            mediaInfo.tracks.push(castTrack);
        }

        if (mediaElement) {
            if (mediaElement instanceof HTMLVideoElement) {
                if (mediaElement.poster) {
                    mediaInfo.metadata.images = [
                        new cast.Image(mediaElement.poster)
                    ];
                }
            }

            if (mediaElement.textTracks.length) {
                const tracks = Array.from(mediaElement.textTracks);
                const trackElements = mediaElement.querySelectorAll("track");

                tracks.forEach((track, index) => {
                    const trackElement = trackElements[index];

                    /**
                     * Create media.Track object with the index as the track ID
                     * and type as TrackType.TEXT.
                     */
                    const castTrack = new cast.media.Track(
                            trackIndex, cast.media.TrackType.TEXT);

                    // Copy TextTrack properties
                    castTrack.name = track.label || `track-${trackIndex}`;
                    castTrack.language = track.language;
                    castTrack.trackContentId = trackElement.src;
                    castTrack.trackContentType = "text/vtt";

                    switch (track.kind) {
                        case "subtitles":
                            castTrack.subtype =
                                    cast.media.TextTrackType.SUBTITLES;
                            break;
                        case "captions":
                            castTrack.subtype =
                                    cast.media.TextTrackType.CAPTIONS;
                            break;
                        case "descriptions":
                            castTrack.subtype =
                                    cast.media.TextTrackType.DESCRIPTIONS;
                            break;
                        case "chapters":
                            castTrack.subtype =
                                    cast.media.TextTrackType.CHAPTERS;
                            break;
                        case "metadata":
                            castTrack.subtype =
                                    cast.media.TextTrackType.METADATA;
                            break;

                        // Default to subtitles
                        default:
                            castTrack.subtype =
                                    cast.media.TextTrackType.SUBTITLES;
                    }

                    // Add track to mediaInfo
                    mediaInfo.tracks?.push(castTrack);

                    // If enabled, mark as active track for load request
                    if (track.mode === "showing" || trackElement.default) {
                        activeTrackIds.push(trackIndex);
                    }

                    trackIndex++;
                });
            }
        }

        const loadRequest = new cast.media.LoadRequest(mediaInfo);
        loadRequest.autoplay = false;
        loadRequest.activeTrackIds = activeTrackIds;

        currentSession.loadMedia(loadRequest, resolve, reject);
    });
}


let ignoreMediaEvents = false;

async function registerMediaElementListeners() {
    function checkIgnore(ev: Event) {
        if (ignoreMediaEvents) {
            ignoreMediaEvents = false;
            ev.stopImmediatePropagation();
        }
    }

    if (await options.get("mediaSyncElement")) {
        mediaElement.addEventListener("play", checkIgnore, true);
        mediaElement.addEventListener("pause", checkIgnore, true);
        mediaElement.addEventListener("suspend", checkIgnore, true);
        mediaElement.addEventListener("seeking", checkIgnore, true);
        mediaElement.addEventListener("ratechange", checkIgnore, true);
        mediaElement.addEventListener("volumechange", checkIgnore, true);


        mediaElement.addEventListener("play", () => {
            currentMedia.play();
        });

        mediaElement.addEventListener("pause", () => {
            currentMedia.pause();
        });

        mediaElement.addEventListener("suspend", () => {
            // currentMedia.stop(null, null, null);
        });

        mediaElement.addEventListener("seeked", () => {
            const seekRequest = new cast.media.SeekRequest();
            seekRequest.currentTime = mediaElement.currentTime;

            currentMedia.seek(seekRequest);
        });

        mediaElement.addEventListener("ratechange", () => {
            // TODO: Re-implement this
        });

        mediaElement.addEventListener("volumechange", () => {
            const newVolume = new cast.Volume(
                    currentMedia.volume.level
                  , currentMedia.volume.muted);

            const volumeRequest = new cast.media.VolumeRequest(newVolume);

            currentMedia.setVolume(volumeRequest);
        });


        currentMedia.addUpdateListener(isAlive => {
            if (!isAlive) {
                return;
            }

            const localPlayerState = mediaElement.paused
                ? cast.media.PlayerState.PAUSED
                : cast.media.PlayerState.PLAYING;

            if (localPlayerState !== currentMedia.playerState) {
                ignoreMediaEvents = true;

                switch (currentMedia.playerState) {
                    case cast.media.PlayerState.PLAYING: {
                        mediaElement.play();
                        break;
                    }
                    case cast.media.PlayerState.PAUSED: {
                        mediaElement.pause();
                        break;
                    }
                }
            }


            const localRepeatMode = mediaElement.loop
                ? cast.media.RepeatMode.SINGLE
                : cast.media.RepeatMode.OFF;

            if (localRepeatMode !== currentMedia.repeatMode) {
                ignoreMediaEvents = true;

                switch (currentMedia.repeatMode) {
                    case cast.media.RepeatMode.SINGLE: {
                        mediaElement.loop = true;
                        break;
                    }
                    case cast.media.RepeatMode.OFF: {
                        mediaElement.loop = false;
                        break;
                    }
                }
            }


            if (currentMedia.currentTime !== mediaElement.currentTime) {
                ignoreMediaEvents = true;
                mediaElement.currentTime = currentMedia.currentTime;
            }
        });
    }
}


interface InitOptions {
    mediaUrl: string;
    receiver?: ReceiverDevice;
    targetElementId?: number;
}

export async function init(opts: InitOptions) {
    backgroundPort = await ensureInit();

    const isLocalMedia = opts.mediaUrl.startsWith("file://");
    const isLocalMediaEnabled = await options.get("localMediaEnabled");

    if (isLocalMedia && !isLocalMediaEnabled) {
        cast.logMessage("Local media casting not enabled");
        return;
    }

    if (opts.targetElementId) {
        mediaElement = browser.menus.getTargetElement(
                opts.targetElementId) as HTMLMediaElement;
    }

    currentSession = await getSession(opts);
    currentMedia = await getMedia(opts);

    if (opts.targetElementId) {
        registerMediaElementListeners();

        if (options.get("mediaOverlayEnabled")) {
            // TODO: Un-hide overlay here
        }

        window.addEventListener("beforeunload", async () => {
            backgroundPort.postMessage({
                subject: "bridge:mediaServer/stop"
            });

            if (await options.get("mediaStopOnUnload")) {
                currentSession.stop();
            }
        });
    }
}

/**
 * If loaded as a content script, the init values are
 * provided on the window object.
 */
if (window.location.protocol !== "moz-extension:") {
    const _window = (window as any);

    init({
        mediaUrl: _window.mediaUrl
      , receiver: _window.receiver
      , targetElementId: _window.targetElementId
    });
}
