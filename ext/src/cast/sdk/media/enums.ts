"use strict";

export enum ContainerType {
    GENERIC_CONTAINER
  , AUDIOBOOK_CONTAINER
}

export enum HdrType {
    SDR = "sdr"
  , HDR = "hdr"
  , DV = "dv"
}

export enum HlsSegmentFormat {
    AAC = "aac"
  , AC3 = "ac3"
  , MP3 = "mp3"
  , TS = "ts"
  , TS_AAC = "ts_aac"
  , E_AC3 = "e_ac3"
  , FMP4 = "fmp4"
}

export enum HlsVideoSegmentFormat {
    MPEG2_TS = "mpeg2_ts"
  , FMP4 = "fmp4"
}

export enum IdleReason {
    CANCELLED = "CANCELLED"
  , INTERRUPTED = "INTERRUPTED"
  , FINISHED = "FINISHED"
  , ERROR = "ERROR"
}

export enum MediaCommand {
    PAUSE = "pause"
  , SEEK = "seek"
  , STREAM_VOLUME = "stream_volume"
  , STREAM_MUTE = "stream_mute"
}

export enum MetadataType {
    GENERIC
  , MOVIE
  , TV_SHOW
  , MUSIC_TRACK
  , PHOTO
  , AUDIOBOOK_CHAPTER
}

export enum PlayerState {
    IDLE = "IDLE"
  , PLAYING = "PLAYING"
  , PAUSED = "PAUSED"
  , BUFFERING = "BUFFERING"
}

export enum QueueType {
    ALBUM = "ALBUM"
  , PLAYLIST = "PLAYLIST"
  , AUDIOBOOK = "AUDIOBOOK"
  , RADIO_STATION = "RADIO_STATION"
  , PODCAST_SERIES = "PODCAST_SERIES"
  , TV_SERIES = "TV_SERIES"
  , VIDEO_PLAYLIST = "VIDEO_PLAYLIST"
  , LIVE_TV = "LIVETV"
  , MOVIE = "MOVIE"
}

export enum RepeatMode {
    OFF = "REPEAT_OFF"
  , ALL = "REPEAT_ALL"
  , SINGLE = "REPEAT_SINGLE"
  , ALL_AND_SHUFFLE = "REPEAT_ALL_AND_SHUFFLE"
}

export enum ResumeState {
    PLAYBACK_START = "PLAYBACK_START"
  , PLAYBACK_PAUSE = "PLAYBACK_PAUSE"
}

export enum StreamType {
    BUFFERED = "BUFFERED"
  , LIVE = "LIVE"
  , OTHER = "OTHER"
}

export enum TextTrackEdgeType {
    NONE = "NONE"
  , OUTLINE = "OUTLINE"
  , DROP_SHADOW = "DROP_SHADOW"
  , RAISED = "RAISED"
  , DEPRESSED = "DEPRESSED"
}

export enum TextTrackFontGenericFamily {
    SANS_SERIF = "SANS_SERIF"
  , MONOSPACED_SANS_SERIF = "MONOSPACED_SANS_SERIF"
  , SERIF = "SERIF"
  , MONOSPACED_SERIF = "MONOSPACED_SERIF"
  , CASUAL = "CASUAL"
  , CURSIVE = "CURSIVE"
  , SMALL_CAPITALS = "SMALL_CAPITALS"
}

export enum TextTrackFontStyle {
    NORMAL = "NORMAL"
  , BOLD = "BOLD"
  , BOLD_ITALIC = "BOLD_ITALIC"
  , ITALIC = "ITALIC"
}

export enum TextTrackType {
    SUBTITLES = "SUBTITLES"
  , CAPTIONS = "CAPTIONS"
  , DESCRIPTIONS = "DESCRIPTIONS"
  , CHAPTERS = "CHAPTERS"
  , METADATA = "METADATA"
}

export enum TextTrackWindowType {
    NONE = "NONE"
  , NORMAL = "NORMAL"
  , ROUNDED_CORNERS = "ROUNDED_CORNERS"
}

export enum TrackType {
    TEXT = "TEXT"
  , AUDIO = "AUDIO"
  , VIDEO = "VIDEO"
}

export enum UserAction {
    LIKE = "LIKE"
  , DISLIKE = "DISLIKE"
  , FOLLOW = "FOLLOW"
  , UNFOLLOW = "UNFOLLOW"
}
