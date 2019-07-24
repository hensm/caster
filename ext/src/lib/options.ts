"use strict";

import defaultOptions from "../defaultOptions";

import { Message } from "../types";
import { TypedEventTarget } from "./typedEvents";


export interface Options {
    bridgeApplicationName: string;
    mediaEnabled: boolean;
    mediaSyncElement: boolean;
    mediaStopOnUnload: boolean;
    localMediaEnabled: boolean;
    localMediaServerPort: number;
    mirroringEnabled: boolean;
    mirroringAppId: string;
    userAgentWhitelistEnabled: boolean;
    userAgentWhitelist: string[];

    [key: string]: Options[keyof Options];
}


interface EventMap {
    "changed": Array<keyof Options>;
}

// tslint:disable-next-line:new-parens
export default new class extends TypedEventTarget<EventMap> {
    constructor () {
        super();

        browser.storage.onChanged.addListener((changes, areaName) => {
            if (areaName !== "sync") {
                return;
            }

            // Types issue
            const _changes = changes as {
                [key: string]: browser.storage.StorageChange
            };

            if ("options" in _changes) {
                const { oldValue, newValue } = _changes.options;
                const changedKeys = [];

                for (const key in newValue) {
                    // Don't track added keys
                    if (!(key in oldValue)) {
                        continue;
                    }

                    const oldKeyValue = oldValue[key];
                    const newKeyValue = newValue[key];

                    // Equality comparison
                    if (oldKeyValue === newKeyValue) {
                        continue;
                    }

                    // Array comparison
                    if (oldKeyValue instanceof Array
                     && newKeyValue instanceof Array) {
                        if (oldKeyValue.length === newKeyValue.length
                              && oldKeyValue.every((value, index) =>
                                         value === newKeyValue[index])) {
                            continue;
                        }
                    }

                    changedKeys.push(key);
                }

                this.dispatchEvent(new CustomEvent("changed", {
                    detail: changedKeys
                }));
            }
        });
    }

    /**
     * Fetches `options` key from storage and returns it as
     * Options interface type.
     */
    public async getAll (): Promise<Options> {
        const { options }: { options: Options } =
                await browser.storage.sync.get("options");

        return options;
    }

    /**
     * Takes Options object and sets to `options` storage key.
     * Returns storage promise.
     */
    public async setAll (options: Options): Promise<void> {
        return browser.storage.sync.set({ options });
    }

    /**
     * Gets specific option from storage and returns it as its
     * type from Options interface type.
     */
    public async get<T extends keyof Options> (name: T): Promise<Options[T]> {
        const options = await this.getAll();

        if (options.hasOwnProperty(name)) {
            return options[name];
        }
    }

    /**
     * Sets specific option to storage. Returns storage
     * promise.
     */
    public async set<T extends keyof Options> (
            name: T
          , value: Options[T]): Promise<void> {

        const options = await this.getAll();
        options[name] = value;
        return this.setAll(options);
    }


    /**
     * Gets existing options from storage and compares it
     * against defaults. Any options in defaults and not in
     * storage are set. Does not override any existing options.
     */
    public async update (defaults = defaultOptions): Promise<void> {
        const oldOpts = await this.getAll();
        const newOpts: Partial<Options> = {};

        // Find options not already in storage
        for (const [ optName, optVal ] of Object.entries(defaults)) {
            if (!oldOpts.hasOwnProperty(optName)) {
                newOpts[optName] = optVal;
            }
        }

        // Update storage with default values of new options
        return this.setAll({
            ...oldOpts
          , ...newOpts
        });
    }
};
