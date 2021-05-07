"use strict";

import logger from "../../../lib/logger";

import RemotePlayer from "./RemotePlayer";


export default class RemotePlayerController extends EventTarget {
    constructor(_player: RemotePlayer) {
        super();
        logger.info("STUB :: RemotePlayerController#constructor");
    }

    public getFormattedTime(timeInSec: number): string {
        const hours = Math.floor(timeInSec / 3600) % 24;
        const minutes = Math.floor(timeInSec / 60) % 60;
        const seconds = timeInSec % 60;

        return [ hours, minutes, seconds ]
            .map(c => c.toString().padStart(2, "0"))
            .join(":");
    }

    public getSeekPosition(currentTime: number, duration: number) {
        return (currentTime / duration) * 100;
    }

    public getSeekTime(currentPosition: number, duration: number) {
        return (duration / 100) * currentPosition;
    }

    public muteOrUnmute(): void {
        logger.info("STUB :: RemotePlayerController#muteOrUnmute");
    }

    public playOrPause(): void {
        logger.info("STUB :: RemotePlayerController#playOrPause");
    }

    public seek(): void {
        logger.info("STUB :: RemotePlayerController#seek");
    }

    public setVolumeLevel(): void {
        logger.info("STUB :: RemotePlayerController#setVolumeLevel");
    }

    public stop(): void {
        logger.info("STUB :: RemotePlayerController#stop");
    }
}
