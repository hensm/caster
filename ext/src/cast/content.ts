"use strict";

import { CAST_LOADER_SCRIPT_URL
       , CAST_SCRIPT_URLS } from "../lib/endpoints";


const _window = (window.wrappedJSObject as any);

_window.chrome = cloneInto({}, window);

/**
 * YouTube won't load the cast SDK unless it thinks the
 * presentation API exists.
 */
if (window.location.host === "www.youtube.com") {
    _window.navigator.presentation = cloneInto({}, window);
}


/**
 * Replace the src property setter on <script> elements to
 * intercept the new value.
 *
 * If it matches one of Chrome's cast extension sender script
 * URLs, replace it with the standard API URL, the request for
 * which is handled in the main script.
 */
const desc = Reflect.getOwnPropertyDescriptor(
        HTMLScriptElement.prototype.wrappedJSObject, "src");

Reflect.defineProperty(
        HTMLScriptElement.prototype.wrappedJSObject, "src", {

    configurable: true
  , enumerable: true
  , get: desc?.get

  , set: exportFunction(function setFunc(this: HTMLScriptElement, value) {
        if (CAST_SCRIPT_URLS.includes(value)) {
            return desc?.set?.call(this, CAST_LOADER_SCRIPT_URL);
        }

        return desc?.set?.call(this, value);
    }, window)
});
