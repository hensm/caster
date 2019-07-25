"use strict";

import { Options } from "./lib/options";
import { ReceiverSelectorType } from "./receiver_selectors";


export default {
    bridgeApplicationName: APPLICATION_NAME
  , mediaEnabled: true
  , mediaSyncElement: false
  , mediaStopOnUnload: false
  , localMediaEnabled: true
  , localMediaServerPort: 9555
  , mirroringEnabled: false
  , mirroringAppId: MIRRORING_APP_ID
  , receiverSelectorType: ReceiverSelectorType.Popup
  , receiverSelectorCloseIfFocusLost: true
  , receiverSelectorWaitForConnection: false
  , userAgentWhitelistEnabled: true
  , userAgentWhitelist: [
        "https://www.netflix.com/*"
    ]
} as Options;
