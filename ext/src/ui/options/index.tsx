/* tslint:disable:max-line-length */
"use strict";

import React, { Component } from "react";
import ReactDOM from "react-dom";

import defaultOptions from "../../defaultOptions";

import Bridge from "./Bridge";
import EditableList from "./EditableList";

import bridge, { BridgeInfo } from "../../lib/bridge";
import options, { Options } from "../../lib/options";
import { REMOTE_MATCH_PATTERN_REGEX } from "../../lib/utils";


const _ = browser.i18n.getMessage;

// macOS styles
browser.runtime.getPlatformInfo()
    .then(platformInfo => {
        if (platformInfo.os === "mac") {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "styles/mac.css";
            document.head.appendChild(link);
        }
    });


function getInputValue (input: HTMLInputElement) {
    switch (input.type) {
        case "checkbox":
            return input.checked;
        case "number":
            return parseFloat(input.value);

        default:
            return input.value;
    }
}


interface OptionsAppState {
    hasLoaded: boolean;
    options: Options;
    bridgeInfo: BridgeInfo;
    platform: string;
    bridgeLoading: boolean;
    isFormValid: boolean;
    hasSaved: boolean;
}

class OptionsApp extends Component<{}, OptionsAppState> {
    private form: HTMLFormElement;

    constructor (props: {}) {
        super(props);

        this.state = {
            hasLoaded: false
          , options: null
          , bridgeInfo: null
          , platform: null
          , bridgeLoading: true
          , isFormValid: true
          , hasSaved: false
        };

        this.handleReset = this.handleReset.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleWhitelistChange = this.handleWhitelistChange.bind(this);

        this.getWhitelistItemPatternError
                = this.getWhitelistItemPatternError.bind(this);
    }

    public async componentDidMount () {
        this.setState({
            hasLoaded: true
          , options: await options.getAll()
        });

        const bridgeInfo = await bridge.getInfo();
        const { os } = await browser.runtime.getPlatformInfo();

        this.setState({
            bridgeInfo
          , platform: os
          , bridgeLoading: false
        });
    }

    public render () {
        if (!this.state.hasLoaded) {
            return;
        }

        return (
            <div>
                <Bridge info={ this.state.bridgeInfo }
                        platform={ this.state.platform }
                        loading={ this.state.bridgeLoading } />

                <form id="form" ref={ form => { this.form = form; }}
                        onSubmit={ this.handleFormSubmit }
                        onChange={ this.handleFormChange }>

                    <fieldset className="category">
                        <legend className="category__name">
                            <h2>{ _("optionsMediaCategoryName") }</h2>
                        </legend>
                        <p className="category__description">
                            { _("optionsMediaCategoryDescription") }
                        </p>

                        <label className="option option--inline">
                            <input name="mediaEnabled"
                                   type="checkbox"
                                   checked={ this.state.options.mediaEnabled }
                                   onChange={ this.handleInputChange } />
                            <div className="option__label">
                                { _("optionsMediaEnabled") }
                            </div>
                        </label>

                        <label className="option option--inline">
                            <input name="mediaSyncElement"
                                   type="checkbox"
                                   checked={ this.state.options.mediaSyncElement }
                                   onChange={ this.handleInputChange } />
                            <div className="option__label">
                                { _("optionsMediaSyncElement") }
                            </div>
                        </label>

                        <label className="option option--inline">
                            <input name="mediaStopOnUnload"
                                   type="checkbox"
                                   checked={ this.state.options.mediaStopOnUnload }
                                   onChange={ this.handleInputChange } />
                            <div className="option__label">
                                { _("optionsMediaStopOnUnload") }
                            </div>
                        </label>

                        <fieldset className="category"
                                  disabled={ !this.state.options.mediaEnabled }>
                            <legend className="category__name">
                                <h2>{ _("optionsLocalMediaCategoryName") }</h2>
                            </legend>
                            <p className="category__description">
                                { _("optionsLocalMediaCategoryDescription") }
                            </p>

                            <label className="option option--inline">
                                <input name="localMediaEnabled"
                                       type="checkbox"
                                       checked={ this.state.options.localMediaEnabled }
                                       onChange={ this.handleInputChange } />
                                <div className="option__label">
                                    { _("optionsLocalMediaEnabled") }
                                </div>
                            </label>

                            <label className="option">
                                <div className="option__label">
                                    { _("optionsLocalMediaServerPort") }
                                </div>
                                <input name="localMediaServerPort"
                                       type="number"
                                       required
                                       min="1025"
                                       max="65535"
                                       value={ this.state.options.localMediaServerPort }
                                       onChange={ this.handleInputChange } />
                            </label>
                        </fieldset>
                    </fieldset>

                    <fieldset className="category">
                        <legend className="category__name">
                            <h2>{ _("optionsMirroringCategoryName") }</h2>
                        </legend>
                        <p className="category__description">
                            { _("optionsMirroringCategoryDescription") }
                        </p>

                        <label className="option option--inline">
                            <input name="mirroringEnabled"
                                   type="checkbox"
                                   checked={ this.state.options.mirroringEnabled }
                                   onChange={ this.handleInputChange } />
                            <div className="option__label">
                                { _("optionsMirroringEnabled") }
                            </div>
                        </label>

                        <label className="option">
                            <div className="option__label">
                                { _("optionsMirroringAppId") }
                            </div>
                            <input name="mirroringAppId"
                                   type="text"
                                   required
                                   value={ this.state.options.mirroringAppId }
                                   onChange={ this.handleInputChange } />
                        </label>
                    </fieldset>

                    <fieldset className="category">
                        <legend className="category__name">
                            <h2>{ _("optionsUserAgentWhitelistCategoryName") }</h2>
                        </legend>
                        <p className="category__description">
                            { _("optionsUserAgentWhitelistCategoryDescription") }
                        </p>

                        <label className="option option--inline">
                            <input name="userAgentWhitelistEnabled"
                                   type="checkbox"
                                   checked={ this.state.options.userAgentWhitelistEnabled }
                                   onChange={ this.handleInputChange } />
                            <div className="option__label">
                                { _("optionsUserAgentWhitelistEnabled") }
                            </div>
                        </label>

                        <div className="option">
                            <div className="option__label">
                                { _("optionsUserAgentWhitelistContent") }
                            </div>
                            <EditableList data={ this.state.options.userAgentWhitelist }
                                          onChange={ this.handleWhitelistChange }
                                          itemPattern={ REMOTE_MATCH_PATTERN_REGEX }
                                          itemPatternError={ this.getWhitelistItemPatternError } />
                        </div>
                    </fieldset>

                    <div id="buttons">
                        <div id="status-line">
                            { this.state.hasSaved && _("optionsSaved") }
                        </div>
                        <button onClick={ this.handleReset }
                                type="button">
                            { _("optionsReset") }
                        </button>
                        <button type="submit"
                                default
                                disabled={ !this.state.isFormValid }>
                            { _("optionsSave") }
                        </button>
                    </div>
                </form>
            </div>
        );
    }


    private handleReset () {
        this.setState({
            options: { ...defaultOptions }
        });
    }

    private async handleFormSubmit (ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();

        this.form.reportValidity();

        try {
            await options.setAll(this.state.options);

            this.setState({
                hasSaved: true
            }, () => {
                window.setTimeout(() => {
                    this.setState({
                        hasSaved: false
                    });
                }, 1000);
            });
        } catch (err) {
            console.error("Failed to save options");
        }
    }

    private handleFormChange (ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();

        this.setState({
            isFormValid: this.form.checkValidity()
        });
    }

    private handleInputChange (ev: React.ChangeEvent<HTMLInputElement>) {
        const { target } = ev;

        this.setState(currentState => {
            currentState.options[target.name] = getInputValue(target);
            return currentState;
        });
    }

    private handleWhitelistChange (whitelist: string[]) {
        this.setState(currentState => {
            currentState.options.userAgentWhitelist = whitelist;
            return currentState;
        });
    }

    private getWhitelistItemPatternError (info: string): string {
        return _("optionsUserAgentWhitelistInvalidMatchPattern", info);
    }

    private async updateBridgeInfo () {
        this.setState({
            bridgeLoading: true
        });

        const bridgeInfo = await bridge.getInfo();

        this.setState({
            bridgeInfo
          , bridgeLoading: false
        });
    }
}


ReactDOM.render(
    <OptionsApp />
  , document.querySelector("#root"));
