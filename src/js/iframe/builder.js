/* @flow */
'use strict';

import { create as createDeferred } from '../utils/deferred';
import { IFRAME_HANDSHAKE } from '../constants/ui';
import { IFRAME_TIMEOUT } from '../constants/errors';
import css from './inline-styles';
import type { Deferred } from '../types';

export let instance: HTMLIFrameElement;
export let origin: string;
export const initPromise: Deferred<void> = createDeferred();
export let timeout: number = 0;
export let error: ?string;

let _messageID: number = 0;
// every postMessage to iframe has its own promise to resolve
export const messagePromises: { [key: number]: Deferred<any> } = {};

export const init = async (settings: Object): Promise<void> => {
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

    // eslint-disable-next-line no-irregular-whitespace
    const iframeSrcHost: ?Array<string> = instance.src.match(/^.+\:\/\/[^\‌​/]+/);
    if (iframeSrcHost && iframeSrcHost.length > 0) { origin = iframeSrcHost[0]; }

    const onLoad = () => {
        // TODO: check if loaded iframe is not 404/500 etc.
        if (typeof window.chrome !== 'undefined' && window.chrome.runtime && window.chrome.runtime.onConnect) {
            window.chrome.runtime.onConnect.addListener(() => { });
        }

        instance.contentWindow.postMessage({
            type: IFRAME_HANDSHAKE,
            payload: settings,
        }, origin);

        instance.onload = undefined;
    }

    // IE hack
    if (instance.attachEvent) {
        instance.attachEvent("onload", onLoad);
    } else {
        instance.onload = onLoad;
    }

    // inject iframe into host document body
    if (document.body) {
        document.body.appendChild(instance);
        injectStyleSheet();
    }

    timeout = window.setTimeout(() => {
        initPromise.reject( IFRAME_TIMEOUT );
    }, 30000);

    try {
        await initPromise.promise;
    } catch(error) {
        error = error.message;
        throw error;
    } finally {
        window.clearTimeout(timeout);
        timeout = 0;
    }

};

const injectStyleSheet = (): void => {
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

// post messages to iframe
export const postMessage = (message: any, usePromise: boolean = true): ?Promise<void> => {
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
        } catch(error) {

        }
    }
}
