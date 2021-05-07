"use strict";

import logger from "../../lib/logger";

import ActiveInputStateEventData from "./classes/ActiveInputStateEventData";
import ApplicationMetadata from "./classes/ApplicationMetadata";
import ApplicationMetadataEventData from "./classes/ApplicationMetadataEventData";
import ApplicationStatusEventData from "./classes/ApplicationStatusEventData";
import CastContext, { instance } from "./classes/CastContext";
import CastOptions from "./classes/CastOptions";
import CastSession from "./classes/CastSession";
import CastStateEventData from "./classes/CastStateEventData";
import EventData from "./classes/EventData";
import MediaSessionEventData from "./classes/MediaSessionEventData";
import RemotePlayer from "./classes/RemotePlayer";
import RemotePlayerChangedEvent from "./classes/RemotePlayerChangedEvent";
import RemotePlayerController from "./classes/RemotePlayerController";
import SessionStateEventData from "./classes/SessionStateEventData";
import VolumeEventData from "./classes/VolumeEventData";

import { ActiveInputState
       , CastContextEventType
       , CastState
       , LoggerLevel
       , RemotePlayerEventType
       , SessionEventType
       , SessionState } from "./enums";

import GoogleCastLauncher from "./GoogleCastLauncher";


export default {
    // Enums
    ActiveInputState, CastContextEventType, CastState, LoggerLevel
  , RemotePlayerEventType, SessionEventType, SessionState

    // Classes
  , ActiveInputStateEventData, ApplicationMetadata
  , ApplicationMetadataEventData, ApplicationStatusEventData, CastOptions
  , CastSession, CastStateEventData, EventData, MediaSessionEventData
  , RemotePlayer, RemotePlayerChangedEvent, RemotePlayerController
  , SessionStateEventData, VolumeEventData

    /**
     * CastContext class with an extra getInstance method used to
     * instantiate and fetch a singleton instance.
     */
  , CastContext: {
        ...CastContext

      , getInstance() {
            return instance;
        }
    }

  , VERSION: "1.0.07"

  , setLoggerLevel(_level: number) {
        logger.info("STUB :: cast.framework.setLoggerLevel");
    }
};


/**
 * The Framework API defines a <google-cast-launcher> element
 * and a <button is="google-cast-button"> element extension,
 * both of which produce the same result.
 *
 * Chrome allowed custom elements to extend <button> elements
 * via Element#createShadowRoot, but the standard
 * Element#attachShadow method supported in Firefox specifies a
 * limited whitelist of elements that are extendable.
 *
 * It's not officially advertised in the cast docs, so it
 * shouldn't be much of a compatibility issue to ignore it.
 */
customElements.define("google-cast-launcher", GoogleCastLauncher);
