/* @flow */
import { Core } from '../../js/core/Core.js';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';
import * as DEVICE from '../../js/constants/device';

import type {
    TestPayload,
    ExpectedResponse,
} from 'flowtype/tests';

export const settings = {
    configSrc: 'base/src/__tests__/config.json', // constant
    debug: true,
    origin: 'localhost',
    priority: 0,
    trustedHost: true,
    connectSrc: '',
    iframeSrc: `iframe.html`,
    popup: false,
    popupSrc: `popup.html`,
    webusbSrc: `webusb.html`,
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
    _urlAcquire = (devicePath: string, previousSession: string = 'null') => `${this._urlBase}/acquire/${devicePath}/${previousSession}`;
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
        console.log('[Start listening to Core]');
        this._core.on('CORE_EVENT', this._handleCoreEvents.bind(this));
    }
    // Public Functions: END

    // Private Functions
    async _handleCoreEvents(event: any): Promise<void> {
        //console.log('[Core Event]', event.type);
        /* if (event.type === DEVICE.CONNECT) {
            console.error('DEVICE CONNECTED', event);
        }         */
        if (event.type === DEVICE.CONNECT && event.payload.path === 'emulator21324' && event.payload.features) {
            this._core.handleMessage({
                type: 'iframe_call',
                id: 1,
                payload: {...this._payload, device: { path: 'emulator21324' }},
            }, true);
        }

        if (event.type === DEVICE.CONNECT_UNACQUIRED && event.payload.path === 'emulator21325') {
            console.log('===[Core connect unacquired]===', event);
            try {
                //await this._releaseDevice();
                //await this._acquireDevice();
                await this._handleButtonRequest();
            } catch(e) {
                console.error('Error on connect unacquired', [e, event]);
                //return;
            }
        }

        if (event.type === UI.REQUEST_BUTTON) {
            console.log('===[Core request button]===', event);
            try {
                //await this._releaseDevice();
                //await this._handleButtonRequest();
                //await this._releaseDevice();
                //console.error('Device Released');
                await this._acquireDevice();
                //console.error('Device Acquired');
            } catch(e) {
                console.error('Error on request button', [e, event]);
                //return;
            }
        }

        if (event.type === UI.REQUEST_UI_WINDOW) {
            this._core.handleMessage({ event: 'UI_EVENT', type: POPUP.HANDSHAKE }, true);
        }

        if (event.type === UI.REQUEST_PERMISSION) {
            const payload = {
                remember: true,
                granted: true,
            };

            this._core.handleMessage({ event: 'UI_EVENT', type: UI.RECEIVE_PERMISSION, payload }, true);
        }

        if (event.type === 'RESPONSE_EVENT') {
            console.warn(event);
            this._compareExpectedResponseToActual(this._expectedResponse, event);
            this._doneFn();
        }
    }

    // 'expected' keys (and associated types) must be a subset (or same set) of 'actual' keys
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
            //session = JSON.parse(await this._httpPost(this._urlAcquire(path, session))).session;

            // 3. Call the method
            return this._httpPost(this._urlCall(session), protoButtonPressYes);
        } catch (e) {
            console.error(e);
            return;
        }
    };

    async _acquireDevice(): Promise<any> {
        try {
            let session;
            let path = '';
            const devices: Array<any> = JSON.parse(await this._httpPost(this._urlEnumerate));
            devices.forEach(d => {
                if (d.path === 'emulator21325') {
                    session = d.session;
                    path = d.path;
                }
            });

            return this._httpPost(this._urlAcquire(path, session));
        } catch (e) {
            console.error(e);
            return;
        }
    }

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
