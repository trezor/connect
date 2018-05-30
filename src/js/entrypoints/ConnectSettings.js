/* @flow */
'use strict';

export type CustomMessageField = {
    rule: string,
    options: Object,
    type: string,
    name: string,
    id: number
}
export type CustomMessage = {
    name: string;
    fields: Array<CustomMessageField>;
}

export type ConnectSettings = {
    // debug: boolean | {[k: string]: boolean};
    +configSrc: string;
    debug: boolean;
    origin: ?string;
    priority: number;
    trustedHost: boolean;
    connectSrc: string;
    iframeSrc: string;
    popup: boolean;
    popupSrc: string;
    webusbSrc: string;
    coinsSrc: string;
    firmwareReleasesSrc: string;
    customMessages: Array<CustomMessage>;
    transportConfigSrc: string;
    latestBridgeSrc: string;
    transportReconnect: boolean;
    webusb: boolean;
    pendingTransportEvent: boolean;
}

/*
 * Initial settings for connect.
 * It could be changed by passing values into TrezorConnect.init(...) method
 */

const DEFAULT_DOMAIN: string = 'https://connect.trezor.io/5/';
export const DEFAULT_PRIORITY: number = 2;

const initialSettings: ConnectSettings = {
    configSrc: 'data/config.json', // constant
    debug: false,
    origin: null,
    priority: DEFAULT_PRIORITY,
    trustedHost: false,
    connectSrc: DEFAULT_DOMAIN,
    iframeSrc: `${ DEFAULT_DOMAIN }iframe.html`,
    popup: true,
    popupSrc: `${ DEFAULT_DOMAIN }popup.html`,
    webusbSrc: `${ DEFAULT_DOMAIN }webusb.html`,
    coinsSrc: 'data/coins.json',
    firmwareReleasesSrc: 'data/releases-1.json',
    transportConfigSrc: 'data/messages.json',
    customMessages: [],
    latestBridgeSrc: 'data/latest.txt',
    transportReconnect: false,
    webusb: true,
    pendingTransportEvent: true,
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

    if (typeof input.connectSrc === 'string') {
        // TODO: escape string, validate url
        settings.connectSrc = input.connectSrc;
        settings.iframeSrc = `${ input.connectSrc }iframe.html`;
        settings.popupSrc = `${ input.connectSrc }popup.html`;
        settings.webusbSrc = `${ input.connectSrc }webusb.html`;
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

    if (typeof input.webusb === 'boolean') {
        settings.webusb = input.webusb;
    }

    if (typeof input.popup === 'boolean') {
        settings.popup = input.popup;
    }

    if (typeof input.pendingTransportEvent === 'boolean') {
        settings.pendingTransportEvent = input.pendingTransportEvent;
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
