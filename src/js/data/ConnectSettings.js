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

// const DEFAULT_DOMAIN: string = 'https://connect.trezor.io/5/';
// $FlowIssue
const DEFAULT_DOMAIN: string = typeof LOCAL === 'string' ? 'http://localhost:8082/' : 'https://sisyfos.trezor.io/next/';
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

    currentSettings = settings;
    return currentSettings;
};
