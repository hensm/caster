"use strict";

export enum ActiveInputState {
    ACTIVE_INPUT_STATE_UNKNOWN = -1
  , ACTIVE_INPUT_STATE_NO = 0
  , ACTIVE_INPUT_YES = 1
}

export enum CastContextEventType {
    CAST_STATE_CHANGED = "caststatechanged"
  , SESSION_STATE_CHANGED = "sessionstatechanged"
}

export enum CastState {
    NO_DEVICES_AVAILABLE = "NO_DEVICES_AVAILABLE"
  , NOT_CONNECTED = "NOT_CONNECTED"
  , CONNECTING = "CONNECTING"
  , CONNECTED = "CONNECTED"
}

export enum LoggerLevel {
    DEBUG = 0
  , INFO = 800
  , WARNING = 900
  , ERROR = 1000
  , NONE = 1500
}

export enum RemotePlayerEventType {
    ANY_CHANGE = "anyChanged"
  , IS_CONNECTED_CHANGE = "isConnectedChanged"
  , IS_MEDIA_LOADED_CHANGED = "isMediaLoadedChanged"
  , DURATION_CHANGED = "durationChanged"
  , CURRENT_TIME_CHANGED = "currentTimeChanged"
  , IS_PAUSED_CHANGED = "isPausedChanged"
  , VOLUME_LEVEL_CHANGED = "volumeLevelChanged"
  , CAN_CONTROL_VOLUME_CHANGED = "canControlVolumeChanged"
  , IS_MUTED_CHANGED = "isMutedChanged"
  , CAN_PAUSE_CHANGED = "canPauseChanged"
  , CAN_SEEK_CHANGED = "canSeekChanged"
  , DISPLAY_NAME_CHANGED = "displayNameChanged"
  , STATUS_TEXT_CHANGED = "statusTextChanged"
  , MEDIA_INFO_CHANGED = "mediaInfoChanged"
  , IMAGE_URL_CHANGED = "imageUrlChanged"
  , PLAYER_STATE_CHANGED = "playerStateChanged"
}

export enum SessionEventType {
    APPLICATION_STATUS_CHANGED = "applicationstatuschanged"
  , APPLICATION_METADATA_CHANGED = "applicationmetadatachanged"
  , ACTIVE_INPUT_STATE_CHANGED = "activeinputstatechanged"
  , VOLUME_CHANGED = "volumechanged"
  , MEDIA_SESSION = "mediasession"
}

export enum SessionState {
    NO_SESSION = "NO_SESSION"
  , SESSION_STARTING = "SESSION_STARTING"
  , SESSION_STARTED = "SESSION_STARTED"
  , SESSION_START_FAILED = "SESSION_START_FAILED"
  , SESSION_ENDING = "SESSION_ENDING"
  , SESSION_ENDED = "SESSION_ENDED"
  , SESSION_RESUMED = "SESSION_RESUMED"
}
