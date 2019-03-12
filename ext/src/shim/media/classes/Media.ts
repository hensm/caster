"use strict";

import uuid from "uuid/v1";

import EditTracksInfoRequest from "./EditTracksInfoRequest";
import GetStatusRequest from "./GetStatusRequest";
import PauseRequest from "./PauseRequest";
import PlayRequest from "./PlayRequest";
import QueueInsertItemsRequest from "./QueueInsertItemsRequest";
import QueueReorderItemsRequest from "./QueueReorderItemsRequest";
import QueueUpdateItemsRequest from "./QueueUpdateItemsRequest";
import SeekRequest from "./SeekRequest";
import VolumeRequest from "./VolumeRequest";
import StopRequest from "./StopRequest";
import MediaInfo from "./MediaInfo";
import QueueItem from "./QueueItem";

import Volume from "../../cast/classes/Volume";

import { PlayerState
       , RepeatMode
       , MediaCommand } from "../enums";

import _Error from "../../cast/classes/Error";
import { ErrorCode } from "../../cast/enums";

import { onMessage, sendMessageResponse } from "../../messageBridge";

import { SuccessCallback
       , ErrorCallback
       , UpdateListener
       , Callbacks
       , CallbacksMap } from "../../types";


export default class Media {
    private _id: string = uuid();

    private _updateListeners = new Set<UpdateListener>();
    private _sendMediaMessageCallbacks: CallbacksMap = new Map();

    private _lastCurrentTime: number;


    public activeTrackIds: number[] = null;
    public currentItemId: number = null;
    public customData: any = null;
    public currentTime: number = 0;
    public idleReason: string = null;
    public items: QueueItem[] = null;
    public loadingItemId: number = null;
    public media: MediaInfo = null;
    public playbackRate: number = 1;
    public playerState: string = PlayerState.IDLE;
    public preloadedItemId: number = null;
    public repeatMode: string = RepeatMode.OFF;
    public supportedMediaCommands: string[] = [];
    public volume: Volume = new Volume();

    constructor (
            public sessionId: string
          , public mediaSessionId: number
          , _internalSessionId: string) {

        this._sendMessage("bridge:/media/initialize", {
            sessionId
          , mediaSessionId
          , _internalSessionId
        });

        onMessage(message => {
            if (!message._id || message._id !== this._id) {
                return;
            }

            switch (message.subject) {
                case "shim:/media/update": {
                    const status = message.data;

                    this.currentTime = status.currentTime;
                    this._lastCurrentTime = status._lastCurrentTime;
                    this.customData = status.customData;
                    this.volume = new Volume(
                            status._volumeLevel
                          , status._volumeMuted);
                    this.playbackRate = status.playbackRate;
                    this.playerState = status.playerState;
                    this.repeatMode = status.repeatMode;

                    if (status.media) {
                        this.media = status.media;
                    }
                    if (status.mediaSessionId) {
                        this.mediaSessionId = status.mediaSessionId;
                    }

                    // Call update listeners
                    for (const listener of this._updateListeners) {
                        listener(true);
                    }

                    break;
                }

                case "shim:/media/sendMediaMessageResponse": {
                    const { messageId, error } = message.data;
                    const [ successCallback, errorCallback ]
                            = this._sendMediaMessageCallbacks.get(messageId);

                    if (error && errorCallback) {
                        errorCallback(new _Error(ErrorCode.SESSION_ERROR));
                    } else if (successCallback) {
                        successCallback();
                    }

                    break;
                }

            }
        });
    }

    public addUpdateListener (listener: UpdateListener): void {
        this._updateListeners.add(listener);
    }

    public editTracksInfo (
            editTracksInfoRequest: EditTracksInfoRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback): void {

        console.log("STUB :: Media#editTracksInfo");
    }

    public getEstimatedTime (): number {
        if (!this.currentTime) {
            return 0;
        }

        return this.currentTime
                + ((Date.now() / 1000) - this._lastCurrentTime);
    }

    public getStatus (
            getStatusRequest?: GetStatusRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {

        this._sendMediaMessage({ type: "MEDIA_GET_STATUS" }
              , successCallback, errorCallback);
    }

    public pause (
            pauseRequest: PauseRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {

        this._sendMediaMessage({ type: "PAUSE" }
              , successCallback, errorCallback);
    }

    public play (
            playRequest?: PlayRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {

        this._sendMediaMessage({ type: "PLAY" }
              , successCallback, errorCallback);
    }

    public queueAppendItem (
            item: QueueItem
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueAppendItem");
    }

    public queueInsertItems (
            queueInsertItemsRequest: QueueInsertItemsRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueInsertItems");
    }

    public queueJumpToItem (
            itemId: number
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueJumpToItem");
    }

    public queueMoveItemToNewIndex (
            itemId: number
          , newIndex: number
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueMoveItemToNewIndex");
    }

    public queueNext (
            successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueNext");
    }

    public queuePrev (
            successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queuePrev");
    }

    public queueRemoveItem(
            itemId: number
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueRemoveItem");
    }

    public queueReorderItems (
            queueReorderItemsRequest: QueueReorderItemsRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueReorderItems");
    }

    public queueSetRepeatMode (
            repeatMode: string
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueSetRepeatMode");
    }

    public queueUpdateItems (
            queueUpdateItemsRequest: QueueUpdateItemsRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {
        console.log("STUB :: Media#queueUpdateItems");
    }

    public removeUpdateListener (listener: UpdateListener) {
        this._updateListeners.delete(listener);
    }

    public seek (
            seekRequest: SeekRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {

        this._sendMediaMessage({
            type: "SEEK"
          , currentTime: seekRequest.currentTime
        }, successCallback, errorCallback);
    }

    public setVolume (
            volumeRequest: VolumeRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {

        this._sendMediaMessage({
            type: "SET_VOLUME"
          , volume: volumeRequest.volume
        }, successCallback, errorCallback);
    }

    public stop (
            stopRequest: StopRequest
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {

        this._sendMediaMessage({
            type: "STOP"
        }, successCallback, errorCallback);
    }

    public supportsCommand (command: string) {
        console.log("STUB :: Media#supportsCommand");
    }


    private _sendMessage (subject: string, data: {}) {
        sendMessageResponse({
            subject
          , data
          , _id: this._id
        });
    }

    private _sendMediaMessage (
            message: any
          , successCallback?: SuccessCallback
          , errorCallback?: ErrorCallback) {

        message.mediaSessionId = this.mediaSessionId;
        message.requestId = 0;
        message.sessionId = this.sessionId;
        message.customData = null;

        const messageId = uuid();

        this._sendMediaMessageCallbacks.set(messageId, [
            successCallback
          , errorCallback
        ]);

        this._sendMessage("bridge:/media/sendMediaMessage", {
            message
          , messageId
        });
    }
}
