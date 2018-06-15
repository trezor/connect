/* @flow */
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

export const settings = {
    configSrc: 'base/src/data/config.json', // constant
    debug: false,
    origin: 'localhost',
    priority: 0,
    trustedHost: true,
    connectSrc: '',
    iframeSrc: `iframe.html`,
    popup: false,
    popupSrc: `popup.html`,
    webusbSrc: `webusb.html`,
    coinsSrc: 'base/src/data/coins.json',
    firmwareReleasesSrc: 'base/src/data/releases-1.json',
    transportConfigSrc: 'base/src/data/messages.json',
    customMessages: [],
    latestBridgeSrc: 'base/src/data/latest.txt',
    transportReconnect: false,
    webusb: true,
    pendingTransportEvent: true,
}

export class AbstractCoreEventHandler {
    _core: Core;
    _payload: any;

    _urlBase: string = 'http://127.0.0.1:21325';
    _urlEnumerate: string = `${this._urlBase}/enumerate`;
    _urlAcquire = (devicePath: string, session: string = 'null') => `${this._urlBase}/acquire/${devicePath}/${session}`;
    _urlCall = (session: any) => `${this._urlBase}/call/${session}`;
    _urlRelease = (session: any) => `${this._urlBase}/release/${session}`;

    constructor(core: Core, payload: any) {
        this._core = core;
        this._payload = payload;
    }

    startListening() {
        this._core.on('CORE_EVENT', this._handleCoreEvents.bind(this));
    }

    // Private Functions
    async _handleCoreEvents(event: any): Promise<void> {
        if (event.type === 'device__connect') {
            this._core.handleMessage({
                type: 'iframe_call',
                id: 1,
                payload: this._payload
            }, true);
            return;
        }

        if (event.type === UI.REQUEST_BUTTON) {
            await this._releaseDevice();
            await this._handleButtonRequest();
            return;
        }

        if (event.type === UI.REQUEST_UI_WINDOW) {
            this._core.handleMessage({ event: 'UI_EVENT', type: POPUP.HANDSHAKE }, true);
            return;
        }

        if (event.type === 'RESPONSE_EVENT') {
            this.handleResponseEvent(event);
            return;
        }
    }

    async _handleButtonRequest(): Promise<void> {
        const protoButtonPressYes = '0064000000020801';
        try {
            // 1. Enumerate, pick a device with name emulator21325 and save its 'session' value
            let session;
            let path = '';
            const devices: Array<any> = JSON.parse(await this._httpPost(this._urlEnumerate));
            devices.forEach(d => {
                if (d.path === 'emulator21325') {
                    session = d.session;
                    path = d.path;
                }
            });

            // 2. Acquire this device using saved session value
            session = JSON.parse(await this._httpPost(this._urlAcquire(path, session))).session;

            // 3. Call the method
            await this._httpPost(this._urlCall(session), protoButtonPressYes);
        } catch (e) {
            console.error(e);
        }
    };

    async _releaseDevice(): Promise<void> {
        let session = null;
        const devices: Array<any> = JSON.parse(await this._httpPost(this._urlEnumerate));
        devices.forEach(d => {
            if (d.path === 'emulator21325') {
                session = d.session;
            }
        });

        if (session !== null) {
            const response = await this._httpPost(this._urlRelease(session));
        } else {
            console.warn('Cannot release null')
        }
    }

    _httpPost(url: string, data?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText,
                        response: xhr.response,
                        url,
                    });
                }
            };

            xhr.onerror = () => {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    response: xhr.response,
                    url,
                });
            };

            xhr.send(data);
        });
    }
    // Private Functions: END

    handleResponseEvent(event: any): void {
        // To override
    }
}
