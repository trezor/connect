/* @flow */
import { Core } from '../../js/core/Core.js';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import type {
    TestPayload,
    ExpectedResponse,
} from 'flowtype/tests';

export const settings = {
    configSrc: 'base/src/data/config.json', // constant
    debug: true,
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

export class CoreEventHandler {
    _core: Core;
    _payload: TestPayload;
    _expectedResponse: ExpectedResponse;

    _doneFn: any;
    _expectFn: any;

    _urlBase: string = 'http://127.0.0.1:21325';
    _urlEnumerate: string = `${this._urlBase}/enumerate`;
    _urlAcquire = (devicePath: string, session: string = 'null') => `${this._urlBase}/acquire/${devicePath}/${session}`;
    _urlCall = (session: any) => `${this._urlBase}/call/${session}`;
    _urlRelease = (session: any) => `${this._urlBase}/release/${session}`;

    constructor(core: Core, payload: TestPayload, expectedResponse: ExpectedResponse, expectFn: any, doneFn: any) {
        this._core = core;
        this._payload = payload;
        this._expectedResponse = expectedResponse;

        this._expectFn = expectFn;
        this._doneFn = doneFn;
    }

    // Public Functions
    startListening() {
        this._core.on('CORE_EVENT', this._handleCoreEvents.bind(this));
    }
    // Public Functions: END

    // Private Functions
    async _handleCoreEvents(event: any): Promise<void> {
        if (event.type === 'device__connect') {
            this._core.handleMessage({
                type: 'iframe_call',
                id: 1,
                payload: {...this._payload, device: { path: 'emulator21324' }},
            }, true);
        }

        if (event.type === UI.REQUEST_BUTTON) {
            try {
                await this._releaseDevice();
                await this._handleButtonRequest();
            } catch(e) {
                console.error('Error handling button', e);
                return;
            }
        }

        if (event.type === UI.REQUEST_UI_WINDOW) {
            this._core.handleMessage({ event: 'UI_EVENT', type: POPUP.HANDSHAKE }, true);
        }

        if (event.type === 'RESPONSE_EVENT') {
            // TODO: Workaround for a 'Device call in progress' error when device is waiting for a button response
            const payload = event.payload;
            if (payload) {
                if (payload.error === 'Device call in progress' || payload.error === 'session not found') {
                    return;
                }
            }
            //

            console.warn(event);
            this._compareExpectedResponseToActual(this._expectedResponse, event);
            this._doneFn();
        }
    }

    // 'expected' keys (and associated types) must be a subset (same set) of the 'actual' keys
    // i.e. 'expected' is the ancestor of the 'actual'
    // this function doesn't compare whether two objects have same keys
    // the premise is that both objects have same keys but may have different values
    _compareExpectedResponseToActual(expected: any, actual: any): void {
        Object.keys(expected).forEach(key => {
            if (typeof expected[key] === 'object') {
                // Traverse inner object
                const innerExpected = expected[key];
                const innerActual = actual[key];
                this._compareExpectedResponseToActual(innerExpected, innerActual);
            } else {
                const valueExpected = expected[key];
                const valueActual = actual[key];

                this._expectFn(valueActual).toEqual(valueExpected);
            }
        });
    }

    async _handleButtonRequest(): Promise<any> {
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
            return this._httpPost(this._urlCall(session), protoButtonPressYes);
        } catch (e) {
            console.error(e);
            return;
        }
    };

    async _releaseDevice(): Promise<any> {
        let session = null;
        const devices: Array<any> = JSON.parse(await this._httpPost(this._urlEnumerate));
        devices.forEach(d => {
            if (d.path === 'emulator21325') {
                session = d.session;
            }
        });

        if (session !== null) {
            return this._httpPost(this._urlRelease(session));
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
}
