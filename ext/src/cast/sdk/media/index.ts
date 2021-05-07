"use strict";

import Media from "./Media";


export { Media };

export * from "./dataClasses";
export * from "./enums";

export const timeout = {
    editTracksInfo: 0
  , getStatus: 0
  , load: 0
  , pause: 0
  , play: 0
  , queue: 0
  , seek: 0
  , setVolume: 0
  , stop: 0
};

export const DEFAULT_MEDIA_RECEIVER_APP_ID = "CC1AD845";
