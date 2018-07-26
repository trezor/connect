/* @flow */
'use strict';

export type ConnectSettings = {
    // debug: boolean | {[k: string]: boolean};
    +configSrc: string, // constant
    debug: boolean,
    origin: ?string,
    priority: number,
    trustedHost: boolean,
    connectSrc: string,
    iframeSrc: string,
    popup: boolean,
    popupSrc: string,
    webusbSrc: string,
    transportReconnect: boolean,
    webusb: boolean,
    pendingTransportEvent: boolean,
    supportedBrowser?: boolean,
}

/*
 * Initial settings for connect.
 * It could be changed by passing values into TrezorConnect.init(...) method
 */

const VERSION: string = '5.1.25';
const versionN: Array<number> = VERSION.split('.').map(s => parseInt(s));
const DEFAULT_DOMAIN: string = 'https://connect.trezor.io/';
const SRC: string = window.__TREZOR_CONNECT_SRC || `${ DEFAULT_DOMAIN }${ versionN[0] }${ ( versionN[1] > 0 ? `.${versionN[1]}` : '' ) }/`;

export const DEFAULT_PRIORITY: number = 2;

const initialSettings: ConnectSettings = {
    configSrc: 'data/config.json', // constant
    debug: false,
    origin: null,
    priority: DEFAULT_PRIORITY,
    trustedHost: false,
    connectSrc: SRC,
    iframeSrc: `${ SRC }iframe.html`,
    popup: true,
    popupSrc: `${ SRC }popup.html`,
    webusbSrc: `${ SRC }webusb.html`,
    transportReconnect: false,
    webusb: true,
    pendingTransportEvent: true,
    supportedBrowser: !(/Trident|MSIE/.test(navigator.userAgent)),
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

    if (window.location.protocol === 'file:') {
        settings.origin = window.location.origin + window.location.pathname;
    }

    if (typeof input.connectSrc === 'string') {
        // TODO: escape string, validate url
        settings.connectSrc = input.connectSrc;
        settings.iframeSrc = `${ input.connectSrc }iframe.html`;
        settings.popupSrc = `${ input.connectSrc }popup.html`;
        settings.webusbSrc = `${ input.connectSrc }webusb.html`;
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

    // $FlowIssue: settings.excludedDevices field is intentionally not defined in flowtype. it's used only in tests to exclude debug-link device.
    settings.excludedDevices = input.excludedDevices;

    currentSettings = settings;
    return currentSettings;
};
