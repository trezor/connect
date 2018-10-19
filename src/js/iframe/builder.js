/* @flow */
'use strict';

import { create as createDeferred } from '../utils/deferred';
import { IFRAME_HANDSHAKE } from '../constants/ui';
import { IFRAME_TIMEOUT, IFRAME_BLOCKED } from '../constants/errors';
import css from './inline-styles';
import type { Deferred } from '../types';
import type { ConnectSettings } from '../data/ConnectSettings';

export let instance: ?HTMLIFrameElement;
export let origin: string;
export const initPromise: Deferred<void> = createDeferred();
export let timeout: number = 0;
export let error: ?string;

let _messageID: number = 0;
// every postMessage to iframe has its own promise to resolve
export const messagePromises: { [key: number]: Deferred<any> } = {};

export const init = async (settings: ConnectSettings): Promise<void> => {
    const existedFrame: HTMLIFrameElement = (document.getElementById('trezorconnect'): any);
    if (existedFrame) {
        instance = existedFrame;
    } else {
        instance = document.createElement('iframe');
        instance.frameBorder = '0';
        instance.width = '0px';
        instance.height = '0px';
        instance.style.position = 'absolute';
        instance.style.display = 'none';
        instance.style.border = '0px';
        instance.style.width = '0px';
        instance.style.height = '0px';
        instance.id = 'trezorconnect';
    }

    const src: string = `${settings.iframeSrc}?${ Date.now() }`;
    instance.setAttribute('src', src);
    if (settings.webusb) {
        instance.setAttribute('allow', 'usb');
    }

    // eslint-disable-next-line no-irregular-whitespace, no-useless-escape
    const iframeSrcHost: ?Array<string> = instance.src.match(/^.+\:\/\/[^\/]+/);
    if (iframeSrcHost && iframeSrcHost.length > 0) { origin = iframeSrcHost[0]; }

    timeout = window.setTimeout(() => {
        initPromise.reject(IFRAME_TIMEOUT);
    }, 10000);

    const onLoad = () => {
        if (!instance) {
            initPromise.reject(IFRAME_BLOCKED);
            return;
        }
        try {
            // if hosting page is able to access cross-origin location it means that the iframe is not loaded
            const iframeOrigin: ?string = instance.contentWindow.location.origin;
            if (!iframeOrigin || iframeOrigin === 'null') {
                // eslint-disable-next-line no-use-before-define
                handleIframeBlocked();
                return;
            }
        } catch (e) {
            // empty
        }

        let extension: ?string;
        // $FlowIssue chrome is not declared outside
        if (typeof chrome !== 'undefined' && chrome.runtime && typeof chrome.runtime.onConnect !== 'undefined') {
            chrome.runtime.onConnect.addListener(() => { });
            extension = chrome.runtime.id;
        }

        instance.contentWindow.postMessage({
            type: IFRAME_HANDSHAKE,
            payload: {
                settings,
                extension,
            },
        }, origin);

        instance.onload = undefined;
    };

    // IE hack
    if (instance.attachEvent) {
        instance.attachEvent('onload', onLoad);
    } else {
        instance.onload = onLoad;
    }
    // inject iframe into host document body
    if (document.body) {
        document.body.appendChild(instance);
        // eslint-disable-next-line no-use-before-define
        injectStyleSheet();
    }

    try {
        await initPromise.promise;
    } catch (error) {
        throw error.message || error;
    } finally {
        window.clearTimeout(timeout);
        timeout = 0;
    }
};

const injectStyleSheet = (): void => {
    if (!instance) {
        throw IFRAME_BLOCKED;
    }
    const doc: Document = instance.ownerDocument;
    const head: HTMLElement = doc.head || doc.getElementsByTagName('head')[0];
    const style: HTMLStyleElement = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', 'TrezorConnectStylesheet');

    // $FlowIssue
    if (style.styleSheet) { // IE
        // $FlowIssue
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    head.append(style);
};

const handleIframeBlocked = (): void => {
    window.clearTimeout(timeout);

    error = IFRAME_BLOCKED.message;
    // eslint-disable-next-line no-use-before-define
    dispose();
    initPromise.reject(IFRAME_BLOCKED);
};

// post messages to iframe
export const postMessage = (message: any, usePromise: boolean = true): ?Promise<void> => {
    if (!instance) {
        throw IFRAME_BLOCKED;
    }
    if (usePromise) {
        _messageID++;
        message.id = _messageID;
        messagePromises[_messageID] = createDeferred();
        instance.contentWindow.postMessage(message, origin);
        return messagePromises[_messageID].promise;
    }

    instance.contentWindow.postMessage(message, origin);
    return null;
};

export const dispose = () => {
    if (instance && instance.parentNode) {
        try {
            instance.parentNode.removeChild(instance);
        } catch (error) {
            // do nothing
        }
    }
    instance = null;
    timeout = 0;
};

export const clearTimeout = () => {
    window.clearTimeout(timeout);
};
