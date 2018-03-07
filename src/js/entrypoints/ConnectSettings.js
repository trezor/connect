/* @flow */
'use strict';

export type ConnectSettings = {
    // debug: boolean | {[k: string]: boolean};
    debug: boolean,
    trustedHost: boolean,
    iframe_src: string,
    popup_src: string,
    +config_src: string,
    coins_src: string,
    firmware_releases_src: string,
    transport_config_src: string,
    latest_bridge_src: string,
    transport_reconnect: boolean;
    webusb: boolean;
}

/*
 * Initial settings for connect.
 * It could be changed by passing values into TrezorConnect.init(...) method
 */

const initialSettings: ConnectSettings = {
    debug: false,
    trustedHost: false,
    iframe_src: 'iframe.html',
    popup_src: 'popup.html',
    config_src: 'data/config.json',
    coins_src: 'data/coins.json',
    firmware_releases_src: 'data/releases-1.json',
    transport_config_src: 'data/config_signed.bin',
    latest_bridge_src: 'data/latest.txt',
    transport_reconnect: true,
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


    const hostname: string = window.location.hostname;
    const host: string = hostname.substring(hostname.lastIndexOf(".", hostname.lastIndexOf(".") - 1) + 1);
    settings.trustedHost = host === 'localhost' || host === 'trezor.io';

    if (typeof input.iframe_src === 'string') {
        // TODO: escape string
        settings.iframe_src = input.iframe_src;
    }

    if (typeof input.popup_src === 'string') {
        // TODO: escape string
        settings.popup_src = input.popup_src;
    }

    if (typeof input.coins_src === 'string') {
        // TODO: escape string
        settings.coins_src = input.coins_src;
    }

    if (typeof input.firmware_releases_src === 'string') {
        // TODO: escape string
        settings.firmware_releases_src = input.firmware_releases_src;
    }

    if (typeof input.transport_config_src === 'string') {
        // TODO: escape string
        settings.transport_config_src = input.transport_config_src;
    }

    if (typeof input.latest_bridge_src === 'string') {
        // TODO: escape string
        settings.latest_bridge_src = input.latest_bridge_src;
    }

    if (typeof input.transport_reconnect === 'boolean') {
        settings.transport_reconnect = input.transport_reconnect;
    }

    if (input.hasOwnProperty('webusb') && typeof input.webusb === 'string') {
        settings.webusb = (input.webusb === 'true');
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
    const ignored: Array<string> = ['iframe_src', 'popup_src'];
    for (const key of Object.keys(settings)) {
        if (ignored.indexOf(key) < 0) {
            iframe.setAttribute(`data-${key}`, encodeURI(settings[key].toString()));
        }
    }
    return attrs;
};
