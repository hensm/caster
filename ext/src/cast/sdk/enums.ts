"use strict";

export enum AutoJoinPolicy {
    TAB_AND_ORIGIN_SCOPED = "tab_and_origin_scoped"
  , ORIGIN_SCOPED = "origin_scoped"
  , PAGE_SCOPED = "page_scoped"
  , CUSTOM_CONTROLLER_SCOPED = "custom_controller_scoped"
}

export enum Capability {
    VIDEO_OUT = "video_out"
  , AUDIO_OUT = "audio_out"
  , VIDEO_IN = "video_in"
  , AUDIO_IN = "audio_in"
  , MULTIZONE_GROUP = "multizone_group"
}

export enum DefaultActionPolicy {
    CREATE_SESSION = "create_session"
  , CAST_THIS_TAB = "cast_this_tab"
}

export enum DialAppState {
    RUNNING = "running"
  , STOPPED = "stopped"
  , ERROR = "error"
}

export enum ErrorCode {
    CANCEL = "cancel"
  , TIMEOUT = "timeout"
  , API_NOT_INITIALIZED = "api_not_initialized"
  , INVALID_PARAMETER = "invalid_parameter"
  , EXTENSION_NOT_COMPATIBLE = "extension_not_compatible"
  , EXTENSION_MISSING = "extension_missing"
  , RECEIVER_UNAVAILABLE = "receiver_unavailable"
  , SESSION_ERROR = "session_error"
  , CHANNEL_ERROR = "channel_error"
  , LOAD_MEDIA_FAILED = "load_media_failed"
}

export enum ReceiverAction {
    CAST = "cast"
  , STOP = "stop"
}

export enum ReceiverAvailability {
    AVAILABLE = "available"
  , UNAVAILABLE = "unavailable"
}

export enum ReceiverType {
    CAST = "cast"
  , DIAL = "dial"
  , HANGOUT = "hangout"
  , CUSTOM = "custom"
}

export enum SenderPlatform {
    CHROME = "chrome"
  , IOS = "ios"
  , ANDROID = "android"
}

export enum SessionStatus {
    CONNECTED = "connected"
  , DISCONNECTED = "disconnected"
  , STOPPED = "stopped"
}

export enum VolumeControlType {
    ATTENUATION = "attenuation"
  , FIXED = "fixed"
  , MASTER = "master"
}
