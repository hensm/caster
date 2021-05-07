"use strict";

import Session from "./Session";

import { AutoJoinPolicy
       , Capability
       , DefaultActionPolicy
       , ReceiverType
       , VolumeControlType } from "./enums";


export class ApiConfig {
    constructor(
            public sessionRequest: SessionRequest
          , public sessionListener: (session: Session) => void
          , public receiverListener: (availability: string) => void

          , public autoJoinPolicy: string
                    = AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED
          , public defaultActionPolicy: string
                    = DefaultActionPolicy.CREATE_SESSION) {}
}


export class CredentialsData {
    constructor(
            public credentials: string
          , public credentialsData: string) {}
}


export class DialRequest {
    constructor(
            public appName: string
          , public launchParameter: Nullable<string> = null) {}
}


export class Error {
    constructor(
            public code: string
          , public description: Nullable<string> = null
          , public details: any = null) {}
}


export class Image {
    width: Nullable<number> = null;
    height: Nullable<number> = null;

    constructor(public url: string) {}
}


export class Receiver {
    displayStatus: Nullable<ReceiverDisplayStatus> = null;
    isActiveInput: Nullable<boolean> = null;
    receiverType = ReceiverType.CAST;

    constructor(
            public label: string
          , public friendlyName: string
          , public capabilities: Capability[] = []
          , public volume: Nullable<Volume> = null) {}
}


export class ReceiverDisplayStatus {
    showStop: Nullable<boolean> = null;

    constructor(
            public statusText: string
          , public appImages: Image[]) {}
}


export class SenderApplication {
    packageId: Nullable<string> = null;
    url: Nullable<string> = null;

    constructor(public platform: string) {}
}


export class SessionRequest {
    language: Nullable<string> = null;

    constructor(
            public appId: string
          , public capabilities = [ Capability.VIDEO_OUT
                                  , Capability.AUDIO_OUT ]
          , public requestSessionTimeout = (new Timeout()).requestSession
          , public androidReceiverCompatible = false
          , public credentialsData: Nullable<CredentialsData> = null) {}
}


export class Timeout {
    leaveSession = 3000;
    requestSession = 60000;
    sendCustomMessage = 3000;
    setReceiverVolume = 3000;
    stopSession = 3000;
}


export class Volume {
    controlType?: VolumeControlType;
    stepInterval?: number;

    constructor(
            public level: Nullable<number> = null
          , public muted: Nullable<boolean> = null) {}
}
