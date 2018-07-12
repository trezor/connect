/* @flow */
'use strict';

import EventEmitter from 'events';
import { INIT, OPENED, HANDSHAKE, CLOSED } from '../constants/popup';
import { showPopupRequest } from './showPopupRequest';
import type { ConnectSettings } from '../data/ConnectSettings';
import type { CoreMessage, Deferred } from '../types';
import { getOrigin } from '../utils/networkUtils';
import { create as createDeferred } from '../utils/deferred';

const POPUP_WIDTH: number = 640;
const POPUP_HEIGHT: number = 500;
// const POPUP_REQUEST_TIMEOUT: number = 602;
const POPUP_REQUEST_TIMEOUT: number = 999;
const POPUP_CLOSE_INTERVAL: number = 500;
const POPUP_OPEN_TIMEOUT: number = 2000;

export default class PopupManager extends EventEmitter {
    _window: any; // Window
    settings: ConnectSettings;
    src: string;
    origin: string;
    locked: boolean;
    requestTimeout: number = 0;
    openTimeout: number;
    closeInterval: number = 0;
    lazyLoad: ?Deferred<boolean>;
    handleLazyLoading: () => void;

    constructor(settings: ConnectSettings) {
        super();
        this.settings = settings;
        this.src = settings.popupSrc;
        this.origin = getOrigin(settings.popupSrc);
        this.handleLazyLoading = this.handleLazyLoading.bind(this);
    }

    request(lazyLoad: boolean = false): void {
        // popup request
        // TODO: ie - open imediately and hide it but post handshake after timeout

        // bring popup window to front
        if (this.locked) {
            if (this._window) { this._window.focus(); }
            return;
        }

        this.lazyLoad = lazyLoad ? createDeferred(INIT) : null;
        if (this.lazyLoad) {
            window.addEventListener('message', this.handleLazyLoading, false);
        }

        const openFn: Function = this.open.bind(this);
        this.locked = true;
        this.requestTimeout = window.setTimeout(() => {
            this.requestTimeout = 0;
            openFn();
            // this.setAddress(settings.popupURL);
        }, POPUP_REQUEST_TIMEOUT);
        // this.open();
    }

    cancel(): void {
        this.close();
    }

    unlock(): void {
        this.locked = false;
    }

    // workaround for IE. hide window (blur) finally set address and window.focus after timeout
    setAddress(url: string): void {
        this._window.location = url;
    }

    open(): void {
        const left: number = (window.screen.width - POPUP_WIDTH) / 2;
        const top: number = (window.screen.height - POPUP_HEIGHT) / 2;
        const width: number = POPUP_WIDTH;
        const height: number = POPUP_HEIGHT;
        const opts: string =
            `width=${width}
            ,height=${height}
            ,left=${left}
            ,top=${top}
            ,menubar=no
            ,toolbar=no
            ,location=no
            ,personalbar=no
            ,status=no
            ,scrollbars=yes`;

        this._window = window.open('', '_blank', opts);
        if (this._window) {
            this._window.location.href = this.lazyLoad ? this.src +'#loading' : this.src; // otherwise android/chrome loose window.opener reference
        }

        this.closeInterval = window.setInterval(() => {
            if (this._window && this._window.closed) {
                this.close();
                this.emit(CLOSED);
            }
        }, POPUP_CLOSE_INTERVAL);

        this.openTimeout = window.setTimeout(() => {
            if (!(this._window && !this._window.closed)) {
                this.close();

                showPopupRequest(this.open.bind(this), () => { this.emit(CLOSED); });
            }
        }, POPUP_OPEN_TIMEOUT);
    }

    handleLazyLoading(event: MessageEvent) {
        if (this.lazyLoad && event.data && event.data === INIT) {
            this.lazyLoad.resolve(true);
            window.removeEventListener('message', this.handleLazyLoading, false);
        }
    }

    async resolveLazyLoad(): Promise<void> {
        if (this.lazyLoad) {
            await this.lazyLoad.promise;
        }
        this._window.postMessage(INIT, this.origin);
    }

    close(): void {
        if (this.requestTimeout) {
            window.clearTimeout(this.requestTimeout);
            this.requestTimeout = 0;
        }

        if (this.openTimeout) {
            window.clearTimeout(this.openTimeout);
            this.openTimeout = 0;
        }
        if (this.closeInterval) {
            window.clearInterval(this.closeInterval);
            this.closeInterval = 0;
        }
        if (this._window) {
            this._window.close();
            this._window = null;
        }
    }

    postMessage(message: CoreMessage): void {
        // post message before popup request finalized
        if (this.requestTimeout) {
            return;
        }

        // device needs interaction but there is no popup/ui
        // maybe popup request wasn't handled
        // ignore "ui_request_window" type
        if (!this._window && message.type !== 'ui_request_window' && this.openTimeout) {
            this.close();
            showPopupRequest(this.open.bind(this), () => { this.emit(CLOSED); });
            return;
        }

        // post message to popup window
        if (this._window) { this._window.postMessage(message, this.origin); }
    }

    onBeforeUnload() {
        this.close();
    }
}
