"use strict";

import { Image, Volume } from "../dataClasses";

import { ContainerType
       , HdrType
       , HlsSegmentFormat
       , HlsVideoSegmentFormat
       , MetadataType
       , RepeatMode
       , ResumeState, StreamType
       , TrackType, UserAction } from "./enums";


export class AudiobookChapterMediaMetadata {
    bookTitle?: string;
    chapterNumber?: number;
    chapterTitle?: string;
    images?: Image[];
    subtitle?: string;
    title?: string;
    type = MetadataType.AUDIOBOOK_CHAPTER;
}

export class AudiobookContainerMetadata {
    authors?: string[];
    narrators?: string[];
    publisher?: string;
    releaseDate?: string;
}

export class Break {
    duration?: number;
    isEmbedded?: boolean;
    isWatched = false;

    constructor(
            public id: string
          , public breakClipIds: string[]
          , public position: number) {}
}

export class BreakClip {
    clickThroughUrl?: string;
    contentId?: string;
    contentType?: string;
    contentUrl?: string;
    customData?: {};
    duration?: number;
    hlsSegmentFormat?: HlsSegmentFormat;
    posterUrl?: string;
    title?: string;
    vastAdsRequest?: VastAdsRequest;
    whenSkippable?: number;

    constructor(public id: string) {}
}

export class BreakStatus {
    breakClipId?: string;
    breakId?: string;
    currentBreakClipTime?: number;
    currentBreakTime?: number;
    whenSkippable?: number;
}

export class ContainerMetadata {
    containerDuration?: number;
    containerImages?: Image[];
    sections?: MediaMetadata[];
    title?: string;

    constructor(
            public containerType: ContainerType =
                    ContainerType.GENERIC_CONTAINER) {}
}

export class EditTracksInfoRequest {
    requestId = 0;

    constructor(
            public activeTrackIds: Nullable<number[]> = null
          , public textTrackStyle: Nullable<string> = null) {
    }
}

export class GenericMediaMetadata {
    images?: Image[];
    metadataType = MetadataType.GENERIC;
    releaseDate?: string;
    releaseYear?: number;
    subtitle?: string;
    title?: string;
    type = MetadataType.GENERIC;
}

export class GetStatusRequest {
    customData: any = null;
}

export class LiveSeekableRange {
    constructor(
            public start?: number
          , public end?: number
          , public isMovingWindow?: boolean
          , public isLiveDone?: boolean) {}
}

export class LoadRequest {
    activeTrackIds: Nullable<number[]> = null;
    atvCredentials?: string;
    atvCredentialsType?: string;
    autoplay: Nullable<boolean> = true;
    currentTime: Nullable<number> = null;
    customData: any = null;
    media: MediaInfo;
    requestId = 0;
    sessionId: Nullable<string> = null;
    type: "LOAD" = "LOAD";

    constructor(mediaInfo: MediaInfo) {
        this.media = mediaInfo;
    }
}


export type Metadata =
        GenericMediaMetadata
      | MovieMediaMetadata
      | MusicTrackMediaMetadata
      | PhotoMediaMetadata
      | TvShowMediaMetadata;

export class MediaInfo {
    atvEntity?: string;
    breakClips?: BreakClip[];
    breaks?: Break[];
    customData: any = null;
    contentUrl?: string;
    duration: Nullable<number> = null;
    entity?: string;
    hlsSegmentFormat?: HlsSegmentFormat;
    hlsVideoSegmentFormat?: HlsVideoSegmentFormat;
    metadata: Nullable<Metadata> = null;
    startAbsoluteTime?: number;
    streamType: string = StreamType.BUFFERED;
    textTrackStyle: Nullable<TextTrackStyle> = null;
    tracks: Nullable<Track[]> = null;
    userActionStates?: UserActionState[];
    vmapAdsRequest?: VastAdsRequest;

    constructor(
            public contentId: string
          , public contentType: string) {}
}


export class MediaMetadata {
    queueItemId?: number;
    sectionDuration?: number;
    sectionStartAbsoluteTime?: number;
    sectionStartTimeInContainer?: number;
    sectionStartTimeInMedia?: number;
    type: MetadataType;
    metadataType: MetadataType;

    constructor(type: MetadataType) {
        this.type = type;
        this.metadataType = type;
    }
}

export class MovieMediaMetadata {
    images?: Image[];
    metadataType = MetadataType.MOVIE;
    releaseDate?: string;
    releaseYear?: number;
    studio?: string;
    subtitle?: string;
    title?: string;
    type = MetadataType.MOVIE;
}

export class MusicTrackMediaMetadata {
    albumArtist?: string;
    albumName?: string;
    artist?: string;
    artistName?: string;
    composer?: string;
    discNumber?: number;
    images?: Image[];
    metadataType = MetadataType.MUSIC_TRACK;
    releaseDate?: string;
    releaseYear?: number;
    songName?: string;
    title?: string;
    trackNumber?: number;
    type = MetadataType.MUSIC_TRACK;
}

export class PauseRequest {
    customData: any = null;
}

export class PhotoMediaMetadata {
    artist?: string;
    creationDateTime?: string;
    height?: number;
    images?: Image[];
    latitude?: number;
    location?: string;
    longitude?: number;
    metadataType = MetadataType.PHOTO;
    title?: string;
    type = MetadataType.PHOTO;
    width?: number;
}

export class PlayRequest {
    customData: any = null;
}

export class QueueData {
    shuffle = false;

    constructor(
            public id?: string
          , public name?: string
          , public description?: string
          , public repeatMode?: RepeatMode
          , public items?: QueueItem[]
          , public startIndex?: number
          , public startTime?: number) {}
}

export class QueueInsertItemsRequest {
    customData: any = null;
    insertBefore: Nullable<number> = null;
    requestId: Nullable<number> = null;
    sessionId: Nullable<string> = null;
    type = "QUEUE_INSERT";

    constructor(
            public items: QueueItem[]) {}
}

export class QueueItem {
    activeTrackIds: Nullable<number[]> = null;
    autoplay = true;
    customData: any = null;
    itemId: Nullable<number> = null;
    media: MediaInfo;
    playbackDuration: Nullable<number> = null;
    preloadTime = 0;
    startTime = 0;

    constructor(mediaInfo: MediaInfo) {
        this.media = mediaInfo;
    }
}

export class QueueJumpRequest {
    type = "QUEUE_UPDATE";
    jump: Nullable<number> = null;
    currentItemId: Nullable<number> = null;
}

export class QueueLoadRequest {
    type = "QUEUE_LOAD";
    customData: any = null;
    repeatMode: string = RepeatMode.OFF;
    startIndex = 0;

    constructor(public items: QueueItem[]) {}
}

export class QueueRemoveItemsRequest {
    type = "QUEUE_REMOVE";
    customData: any = null;

    constructor(public itemIds: number[]) {}
}

export class QueueReorderItemsRequest {
    customData: any = null;
    insertBefore: Nullable<number> = null;
    type = "QUEUE_REORDER";

    constructor(public itemIds: number[]) {}
}

export class QueueSetPropertiesRequest {
    type = "QUEUE_UPDATE";
    customData: any = null;
    repeatMode: Nullable<string> = null;
}

export class QueueUpdateItemsRequest {
    type = "QUEUE_UPDATE";
    customData: any = null;

    constructor(public items: QueueItem[]) {}
}


export class SeekRequest {
    currentTime: Nullable<number> = null;
    customData: any = null;
    resumeState: Nullable<ResumeState> = null;
}

export class StopRequest {
    customData: any = null;
}

export class TextTrackStyle {
    backgroundColor: Nullable<string> = null;
    customData: any = null;
    edgeColor: Nullable<string> = null;
    edgeType: Nullable<string> = null;
    fontFamily: Nullable<string> = null;
    fontGenericFamily: Nullable<string> = null;
    fontScale: Nullable<number> = null;
    fontStyle: Nullable<string> = null;
    foregroundColor: Nullable<string> = null;
    windowColor: Nullable<string> = null;
    windowRoundedCornerRadius: Nullable<number> = null;
    windowType: Nullable<string> = null;
}

export class Track {
    customData: any = null;
    language: Nullable<string> = null;
    name: Nullable<string> = null;
    subtype: Nullable<string> = null;
    trackContentId: Nullable<string> = null;
    trackContentType: Nullable<string> = null;

    constructor(
            public trackId: number
          , public type: TrackType) {}
}

export class TvShowMediaMetadata {
    episode?: number;
    episodeNumber?: number;
    episodeTitle?: string;
    images?: Image[];
    metadataType: number = MetadataType.TV_SHOW;
    originalAirdate?: string;
    releaseYear?: number;
    season?: number;
    seasonNumber?: number;
    seriesTitle?: string;
    title?: string;
    type = MetadataType.TV_SHOW;
}

export class UserActionState {
    customData: any = null;

    constructor(
            public userAction: UserAction) {}
}

export class VastAdsRequest {
    adsResponse?: string;
    adTagUrl?: string;
}

export class VideoInformation {
    constructor(
            public width: number
          , public height: number
          , public hdrType: HdrType) {}
}

export class VolumeRequest {
    customData: any = null;

    constructor(
            public volume: Volume) {}
}
