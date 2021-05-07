"use strict";

export default class RemotePlayerChangedEvent {
    constructor(
            public type: string
          , public field: string
          , public value: any) {}
}
