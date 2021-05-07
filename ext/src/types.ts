"use strict";

import { ReceiverStatus } from "./cast/sdk/types";

export interface ReceiverDevice {
    host: string
    friendlyName: string
  , id: string
  , port: number
  , status?: ReceiverStatus
}
