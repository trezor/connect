/* @flow */
'use strict';

export type ConnectSettings = {
    // debug: boolean | {[k: string]: boolean};
    debug: boolean;
    origin: string;
    trustedHost: boolean;
    iframeSrc: string;
    popup: boolean;
    popupSrc: string;
    +configSrc: string;
    coinsSrc: string;
    firmwareReleasesSrc: string;
    transportConfigSrc: string;
    latestBridgeSrc: string;
    transportReconnect: boolean;
    webusb: boolean;
}

/*
 * Initial settings for connect.
 * It could be changed by passing values into TrezorConnect.init(...) method
 */

const DEFAULT_DOMAIN: string = '';

const initialSettings: ConnectSettings = {
    configSrc: 'data/config.json', // constant
    debug: false,
    origin: window.location.origin,
    trustedHost: false,
    iframeSrc: `${ DEFAULT_DOMAIN }iframe.html`,
    popup: true,
    popupSrc: `${ DEFAULT_DOMAIN }popup.html`,
    coinsSrc: 'data/coins.json',
    firmwareReleasesSrc: 'data/releases-1.json',
    transportConfigSrc: 'data/config_signed.bin',
    latestBridgeSrc: 'data/latest.txt',
    transportReconnect: false,
    webusb: true,
};

let currentSettings: ConnectSettings = initialSettings;

export const parse = (input: ?Object): ConnectSettings => {
    if (!input) return currentSettings;

    const settings: ConnectSettings = { ...currentSettings };
    if (input.hasOwnProperty('debug')) {
        if (Array.isArray(input)) {
            // enable log with prefix
        } if (typeof input.debug === 'boolean') {
            settings.debug = input.debug;
        } else if (typeof input.debug === 'string') {
            settings.debug = input.debug === 'true';
        }
    }

    if (input.hasOwnProperty('origin')) {
        settings.origin = input.origin;
    }

    const hostname: string = window.location.hostname;
    const host: string = hostname.substring(hostname.lastIndexOf('.', hostname.lastIndexOf('.') - 1) + 1);

    settings.trustedHost = host === 'localhost' || host === 'trezor.io';

    if (typeof input.iframeSrc === 'string') {
        // TODO: escape string
        settings.iframeSrc = input.iframeSrc;
    }

    if (typeof input.popupSrc === 'string') {
        // TODO: escape string
        settings.popupSrc = input.popupSrc;
    }

    if (typeof input.coinsSrc === 'string') {
        // TODO: escape string
        settings.coinsSrc = input.coinsSrc;
    }

    if (typeof input.firmwareReleasesSrc === 'string') {
        // TODO: escape string
        settings.firmwareReleasesSrc = input.firmwareReleasesSrc;
    }

    if (typeof input.transportConfigSrc === 'string') {
        // TODO: escape string
        settings.transportConfigSrc = input.transportConfigSrc;
    }

    if (typeof input.latestBridgeSrc === 'string') {
        // TODO: escape string
        settings.latestBridgeSrc = input.latestBridgeSrc;
    }

    if (typeof input.transportReconnect === 'boolean') {
        settings.transportReconnect = input.transportReconnect;
    }

    if (input.hasOwnProperty('webusb') && typeof input.webusb === 'boolean') {
        settings.webusb = input.webusb;
    }

    if (input.hasOwnProperty('popup') && typeof input.popup === 'boolean') {
        settings.popup = input.popup;
    }

    currentSettings = settings;
    return currentSettings;
};

export type ValidSettings = {
    [ key: string ]: string,
}

export type IFrameDataAttributes = {
    [ key: string ]: string,
}

export const validate = (input: Object): ValidSettings => {
    // parse(input);
    const valid: ValidSettings = {};

    for (const key of Object.keys(input)) {
        if (typeof initialSettings[key] !== 'undefined') {
            valid[key] = input[key];
        }
    }
    return valid;
};

export const setDataAttributes = (iframe: Element, input: Object): IFrameDataAttributes => {
    const settings: ValidSettings = validate(input);
    const attrs: IFrameDataAttributes = {};
    const ignored: Array<string> = ['iframeSrc', 'popupSrc'];
    for (const key of Object.keys(settings)) {
        if (ignored.indexOf(key) < 0) {
            iframe.setAttribute(`data-${key}`, encodeURI(settings[key].toString()));
        }
    }
    return attrs;
};
