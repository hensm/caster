"use strict";

import logger from "../../../lib/logger";

import CastOptions from "./CastOptions";
import CastSession from "./CastSession";


export default class CastContext extends EventTarget {
    public endCurrentSession(_stopCasting: boolean): void {
        logger.info("STUB :: CastContext#endCurrentSession");
    }

    // @ts-ignore
    public getCastState(): string {
        logger.info("STUB :: CastContext#getCastState");
    }

    // @ts-ignore
    public getCurrentSession(): CastSession {
        logger.info("STUB :: CastContext#getCurrentSession");
    }

    // @ts-ignore
    public getSessionState(): string {
        logger.info("STUB :: CastContext#getSessionState");
    }

    // @ts-ignore
    public requestSession(): Promise<string> {
        logger.info("STUB :: CastContext#requestSession");
    }

    public setOptions(_options: CastOptions): void {
        logger.info("STUB :: CastContext#setOptions");
    }
}

export const instance = new CastContext();
