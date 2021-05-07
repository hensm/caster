"use strict";

import logger from "../../../lib/logger";

import * as cast from "../../sdk";

import ApplicationMetadata from "./ApplicationMetadata";


type MessageListener = (namespace: string, message: string) => void;


export default class CastSession extends EventTarget {
    constructor(_sessionObj: cast.Session, _state: string) {
        super();
        logger.info("STUB :: CastSession#constructor");
    }

    public addMessageListener(
            _namespace: string
          , _listener: MessageListener): void {

        logger.info("STUB :: CastSession#addMessageListener");
    }

    public endSession(_stopCasting: boolean): void {
        logger.info("STUB :: CastSession#endSession");
    }

    // @ts-ignore
    public getActiveInputState(): number {
        logger.info("STUB :: CastSession#getActiveInputState");
    }

    // @ts-ignore
    public getApplicationMetadata(): ApplicationMetadata {
        logger.info("STUB :: CastSession#getApplicationMetadata");
    }

    // @ts-ignore
    public getApplicationStatus(): string {
        logger.info("STUB :: CastSession#getApplicationStatus");
    }

    // @ts-ignore
    public getCastDevice(): cast.Receiver {
        logger.info("STUB :: CastSession#getCastDevice");
    }

    // @ts-ignore
    public getMediaSession(): cast.media.Media {
        logger.info("STUB :: CastSession#getMediaSession");
    }

    // @ts-ignore
    public getSessionId(): string {
        logger.info("STUB :: CastSession#getSessionId");
    }

    // @ts-ignore
    public getSessionObj(): cast.Session {
        logger.info("STUB :: CastSession#getSessionObj");
    }

    // @ts-ignore
    public getSessionState(): string {
        logger.info("STUB :: CastSession#getSessionState");
    }

    // @ts-ignore
    public getVolume(): number {
        logger.info("STUB :: CastSession#getVolume");
    }

    // @ts-ignore
    public isMute(): boolean {
        logger.info("STUB :: CastSession#isMute");
    }

    // @ts-ignore
    public loadMedia(_loadRequest: cast.media.LoadRequest): Promise<string> {
        logger.info("STUB :: CastSession#loadMedia");
    }

    public removeMessageListener(
            _namespace: string
          , _listener: MessageListener): void {

        logger.info("STUB :: CastSession#removeMessageListener");
    }

    public sendMessage(
            _namespace: string
            // @ts-ignore
          , _data: any): Promise<string> {

        logger.info("STUB :: CastSession#sendMessage");
    }

    // @ts-ignore
    public setMute(_isMute: boolean): Promise<string> {
        logger.info("STUB :: CastSession#setMute");
    }

    // @ts-ignore
    public setVolume(_volume: number): Promise<string> {
        logger.info("STUB :: CastSession#setVolume");
    }
}
