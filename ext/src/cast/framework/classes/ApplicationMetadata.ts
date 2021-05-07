"use strict";

import * as cast from "../../sdk";


export default class ApplicationMetadata {
    public applicationId: string;
    public images: cast.Image[];
    public name: string;
    public namespaces: string[];

    constructor(sessionObj: cast.Session) {
        this.applicationId = sessionObj.appId;
        this.images = sessionObj.appImages;
        this.name = sessionObj.displayName;

        // Convert [{ name: <ns> }, ...] to [ <ns>, ... ]
        this.namespaces = sessionObj.namespaces.map(
                namespaceObj => namespaceObj.name);
    }
}
