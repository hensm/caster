"use strict";

import logger from "../lib/logger";
import options from "../lib/options";

import { getChromeUserAgent } from "../lib/userAgents";

import { CAST_FRAMEWORK_LOADER_SCRIPT_URL
       , CAST_LOADER_SCRIPT_URL } from "../lib/endpoints";


// Missing on @types/firefox-webext-browser
type OnBeforeSendHeadersDetails = Parameters<Parameters<
        typeof browser.webRequest.onBeforeSendHeaders.addListener>[0]>[0] & {
    frameAncestors?: Array<{ url: string, frameId: number }>
};
type OnBeforeRequestDetails = Parameters<Parameters<
        typeof browser.webRequest.onBeforeRequest.addListener>[0]>[0] & {
    frameAncestors?: Array<{ url: string, frameId: number }>
};


const originUrlCache: string[] = [];

let platform: string;
let chromeUserAgent: string | undefined;
let chromeUserAgentHybrid: string | undefined;

export async function initWhitelist() {
    logger.info("init (whitelist)");

    if (!platform) {
        // TODO: Allow hybrid UA to be configurable
        platform = (await browser.runtime.getPlatformInfo()).os;
        chromeUserAgent = getChromeUserAgent(platform);
        chromeUserAgentHybrid = getChromeUserAgent(platform, true);

        /**
         * If a UA string can't be obtained, don't bother continuing
         * extension initialization
         */
        if (!chromeUserAgent) {
            throw logger.error("Failed to get Chrome UA string");
        }
    }

    // Register on first run
    await registerUserAgentWhitelist();

    // Re-register when options change
    options.addEventListener("changed", ev => {
        const alteredOpts = ev.detail;

        if (alteredOpts.includes("userAgentWhitelist")
         || alteredOpts.includes("userAgentWhitelistEnabled")) {
            unregisterUserAgentWhitelist();
            registerUserAgentWhitelist();
        }
    });
}


/**
 * Web apps usually only load the sender library and
 * provide cast functionality if the browser is detected
 * as Chrome, so we should rewrite the User-Agent header
 * to reflect this on whitelisted sites.
 */
 async function onWhitelistedBeforeSendHeaders(
        details: OnBeforeSendHeadersDetails) {

    if (!details.requestHeaders) {
        throw logger.error("OnBeforeSendHeaders handler details missing requestHeaders.");
    }

    if (details.originUrl && !originUrlCache.includes(details.originUrl)) {
        originUrlCache.push(details.originUrl);
    }

    const host = details.requestHeaders.find(
            header => header.name === "Host");

    for (const header of details.requestHeaders) {
        if (header.name === "User-Agent") {
            header.value = host?.value === "www.youtube.com"
                ? chromeUserAgentHybrid
                : chromeUserAgent;
            break;
        }
    }

    return {
        requestHeaders: details.requestHeaders
    };
}

/**
 * Requests from within child frames should also adopt
 * the modified User-Agent header to support embedded
 * players on other origins (like CDN domains) when the
 * main site is whitelisted.
 */
function onWhitelistedChildBeforeSendHeaders(
        details: OnBeforeSendHeadersDetails) {

    if (!details.requestHeaders || !details.frameAncestors) {
        return;
    }

    for (const ancestor of details.frameAncestors) {
        if (originUrlCache.includes(ancestor.url)) {
            const host = details.requestHeaders.find(
                    header => header.name === "Host");

            for (const header of details.requestHeaders) {
                if (header.name === "User-Agent") {
                    header.value = host?.value === "www.youtube.com"
                        ? chromeUserAgentHybrid
                        : chromeUserAgent;
                    break;
                }
            }

            return {
                requestHeaders: details.requestHeaders
            };
        }
    }
}


/**
 * Sender applications load a cast_sender.js script that
 * functions as a loader for the internal chrome-extension:
 * hosted script.
 *
 * We can redirect this and inject our own script to setup
 * the API shim.
 */
async function onBeforeCastSDKRequest(details: OnBeforeRequestDetails) {
    if (!details.originUrl || details.tabId === -1) {
        return {};
    }

    // Check against whitelist if restricted mode is enabled
    if (await options.get("userAgentWhitelistRestrictedEnabled")) {
        if (!details?.frameAncestors?.length) {
            if (!originUrlCache.includes(details.originUrl)) {
                return {};
            }
        } else {
            let hasMatchingAncestor = false;
            for (const ancestor of details.frameAncestors) {
                if (originUrlCache.includes(ancestor.url)) {
                    hasMatchingAncestor = true;
                }
            }

            if (!hasMatchingAncestor) {
                return {};
            }
        }
    }

    await browser.tabs.executeScript(details.tabId, {
        code: `
            window.isFramework = ${
                details.url === CAST_FRAMEWORK_LOADER_SCRIPT_URL};
        `
      , frameId: details.frameId
      , runAt: "document_start"
    });

    await browser.tabs.executeScript(details.tabId, {
        file: "cast/contentBridge.js"
      , frameId: details.frameId
      , runAt: "document_start"
    });

    return {
        redirectUrl: browser.runtime.getURL("cast/bundle.js")
    };
}


async function registerUserAgentWhitelist() {
    const { userAgentWhitelist
          , userAgentWhitelistEnabled } = await options.getAll();

    browser.webRequest.onBeforeRequest.addListener(
            onBeforeCastSDKRequest
          , { urls: [
                CAST_LOADER_SCRIPT_URL
              , CAST_FRAMEWORK_LOADER_SCRIPT_URL ]}
          , [ "blocking" ]);

    if (!userAgentWhitelistEnabled || !userAgentWhitelist.length) {
        return;
    }

    browser.webRequest.onBeforeSendHeaders.addListener(
            onWhitelistedBeforeSendHeaders
          , { urls: userAgentWhitelist }
          , [  "blocking", "requestHeaders" ]);

    browser.webRequest.onBeforeSendHeaders.addListener(
            onWhitelistedChildBeforeSendHeaders
          , { urls: [ "<all_urls>" ]}
          , [ "blocking", "requestHeaders" ]);
}

function unregisterUserAgentWhitelist() {
    originUrlCache.length = 0;

    browser.webRequest.onBeforeSendHeaders
            .removeListener(onWhitelistedBeforeSendHeaders);
    browser.webRequest.onBeforeSendHeaders
            .removeListener(onWhitelistedChildBeforeSendHeaders);
    browser.webRequest.onBeforeRequest
            .removeListener(onBeforeCastSDKRequest);
}
