"use strict";

import EventData from "./EventData";

import { SessionEventType } from "../enums";


export default class ActiveInputStateEventData extends EventData {
    constructor(
            public activeInputState: number) {

        super(SessionEventType.ACTIVE_INPUT_STATE_CHANGED);
    }
}
