"use strict";

import ApplicationMetadata from "./ApplicationMetadata";
import EventData from "./EventData";

import { SessionEventType } from "../enums";


export default class ApplicationMetadataEventData extends EventData {
    constructor(
            public metadata: ApplicationMetadata) {

        super(SessionEventType.APPLICATION_METADATA_CHANGED);
    }
}
