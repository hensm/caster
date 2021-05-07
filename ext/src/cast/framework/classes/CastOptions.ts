"use strict";

import * as cast from "../../sdk";


export default class CastOptions {
    public autoJoinPolicy: string = cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED;
    public language: (string | null) = null;
    public receiverApplicationId: (string | null) = null;
    public resumeSavedSession = true;

    constructor(options: CastOptions = ({} as CastOptions)) {
        if (options.autoJoinPolicy) {
            this.autoJoinPolicy = options.autoJoinPolicy;
        }
        if (options.language) {
            this.language = options.language;
        }
        if (options.receiverApplicationId) {
            this.receiverApplicationId = options.receiverApplicationId;
        }
        if (options.resumeSavedSession) {
            this.resumeSavedSession = options.resumeSavedSession;
        }
    }
}
