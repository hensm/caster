"use strict";

import EventData from "./EventData";

import { SessionEventType } from "../enums";


export default class ApplicationStatusEventData extends EventData {
    constructor(
            public status: string) {

        super(SessionEventType.APPLICATION_STATUS_CHANGED);
    }
}
