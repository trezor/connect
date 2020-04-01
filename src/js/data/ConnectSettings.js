/* @flow */

import type {
    Manifest,
    ConnectSettings,
} from '../types';

/*
 * Initial settings for connect.
 * It could be changed by passing values into TrezorConnect.init(...) method
 */

const VERSION = '8.1.0';
const versionN = VERSION.split('.').map(s => parseInt(s));
// const DIRECTORY = `${ versionN[0] }${ (versionN[1] > 0 ? `.${versionN[1]}` : '') }/`;
const DIRECTORY = `${versionN[0]}/`;
const DEFAULT_DOMAIN = `https://connect.trezor.io/${ DIRECTORY }`;
export const DEFAULT_PRIORITY = 2;

const initialSettings: ConnectSettings = {
    configSrc: './data/config.json', // constant
    version: VERSION, // constant
    debug: false,
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
    supportedBrowser: typeof navigator !== 'undefined' ? !(/Trident|MSIE|Edge/.test(navigator.userAgent)) : true,
    manifest: null,
    env: 'web',
    lazyLoad: false,
    timestamp: new Date().getTime(),
};

let currentSettings: ConnectSettings = initialSettings;

const parseManifest = (manifest: ?Manifest): ?Manifest => {
    if (!manifest) return;
    if (typeof manifest.email !== 'string') return;
    if (typeof manifest.appUrl !== 'string') return;

    return {
        email: manifest.email,
        appUrl: manifest.appUrl,
    };
};

export const getEnv = () => {
    // $FlowIssue: chrome is not declared outside the project
    if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.onConnect !== 'undefined') {
        return 'webextension';
    }
    if (typeof navigator !== 'undefined') {
        if (typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative') {
            return 'react-native';
        }
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf(' electron/') > -1) {
            return 'electron';
        }
    }
    // if (typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative') {
    //     return 'react-native';
    // }
    // if (typeof process !== 'undefined' && process.versions.hasOwnProperty('electron')) {
    //     return 'electron';
    // }
    return 'web';
};

export const parse = (input: $Shape<ConnectSettings> = {}) => {
    const settings: ConnectSettings = { ...currentSettings };
    if (Object.prototype.hasOwnProperty.call(input, 'debug')) {
        if (Array.isArray(input)) {
            // enable log with prefix
        } if (typeof input.debug === 'boolean') {
            settings.debug = input.debug;
        } else if (typeof input.debug === 'string') {
            settings.debug = input.debug === 'true';
        }
    }

    if (typeof input.connectSrc === 'string') {
        settings.connectSrc = input.connectSrc;
    }
    // For debugging purposes `connectSrc` could be also defined in url query of hosting page. Usage:
    // https://3rdparty-page.com/?trezor-connect-src=https://localhost:8088/
    if (typeof window !== 'undefined' && window.location && typeof window.location.search === 'string') {
        const vars = window.location.search.split('&');
        const customUrl = vars.find(v => v.indexOf('trezor-connect-src') >= 0);
        if (customUrl) {
            const [, connectSrc] = customUrl.split('=');
            settings.connectSrc = decodeURIComponent(connectSrc);
        }
    }
    const src = settings.connectSrc || DEFAULT_DOMAIN;
    settings.iframeSrc = `${src}iframe.html`;
    settings.popupSrc = `${src}popup.html`;
    settings.webusbSrc = `${src}webusb.html`;

    if (typeof input.transportReconnect === 'boolean') {
        settings.transportReconnect = input.transportReconnect;
    }

    if (typeof input.webusb === 'boolean') {
        settings.webusb = input.webusb;
    }

    if (typeof input.popup === 'boolean') {
        settings.popup = input.popup;
    }

    if (typeof input.lazyLoad === 'boolean') {
        settings.lazyLoad = input.lazyLoad;
    }

    if (typeof input.pendingTransportEvent === 'boolean') {
        settings.pendingTransportEvent = input.pendingTransportEvent;
    }

    // local files
    if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        settings.origin = `file://${window.location.pathname}`;
        settings.webusb = false;
    }

    if (typeof input.extension === 'string') {
        settings.extension = input.extension;
    }

    if (typeof input.env === 'string') {
        settings.env = input.env;
    } else {
        settings.env = getEnv();
    }

    if (typeof input.timestamp === 'number') {
        settings.timestamp = input.timestamp;
    }

    if (typeof input.manifest === 'object') {
        settings.manifest = parseManifest(input.manifest);
    }

    currentSettings = settings;
    return currentSettings;
};
