"use strict";

import * as cast from "../../sdk";

import RemotePlayerController from "./RemotePlayerController";


interface SavedPlayerState {
    mediaInfo: string;
    currentTime: number;
    isPaused: boolean;
}

export default class RemotePlayer {
    public canControlVolume = false;
    public canPause = false;
    public canSeek = false;
    public controller: (RemotePlayerController | null) = null;
    public currentTime = 0;
    public displayName = "";
    public displayStatus = "";
    public duration = 0;
    public imageUrl: (string | null) = null;
    public isConnected = false;
    public isMediaLoaded = false;
    public isMuted = false;
    public isPaused = false;
    public mediaInfo: (cast.media.MediaInfo | null) = null;
    public playerState: (string | null) = null;
    public savedPlayerState: (SavedPlayerState | null) = null;
    public statusText = "";
    public title = "";
    public volumeLevel = 1;
}
