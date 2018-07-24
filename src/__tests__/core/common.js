/* @flow */
import { Core } from '../../js/core/Core.js';
import * as POPUP from '../../js/constants/popup';
import { CORE_EVENT, RESPONSE_EVENT, UI_EVENT } from '../../js/constants';
import * as UI from '../../js/constants/ui';
import * as DEVICE from '../../js/constants/device';

import type {
    TestPayload,
    ExpectedResponse,
} from 'flowtype/tests';

let currentSuite: string = '';

export const settings = {
    configSrc: 'base/src/__tests__/config.json', // constant
    debug: false,
    origin: 'localhost',
    priority: 0,
    trustedHost: true,
    connectSrc: '',
    iframeSrc: 'iframe.html',
    popup: false,
    popupSrc: 'popup.html',
    webusbSrc: 'webusb.html',
    transportReconnect: false,
    webusb: true,
    pendingTransportEvent: true,
    supportedBrowser: true,
    extension: null,
    // excludedDevices: ['emulator21325']
}

export class CoreEventHandler {
    _core: Core;
    _payload: TestPayload;
    _expectedResponse: ExpectedResponse;

    _doneFn: any;
    _expectFn: any;

    _urlBase: string = 'http://127.0.0.1:21325';
    _urlEnumerate: string = `${this._urlBase}/enumerate`;
    _urlAcquire = (devicePath: string, previousSession: number | string = 'null') => `${this._urlBase}/acquire/${devicePath}/${previousSession}`;
    _urlCall = (session: number | string) => `${this._urlBase}/post/${session}`;
    _urlRelease = (session: number | string) => `${this._urlBase}/release/${session}`;

    _isHandlingButtonRequest = false;
    // eslint-disable-next-line no-undef
    _isEmulatorRunning = __karma__.config.isEmulatorRunning === 'true';

    constructor(core: Core, payload: TestPayload, expectedResponse: ExpectedResponse, expectFn: any, doneFn: any) {
        this._core = core;
        this._payload = payload;
        this._expectedResponse = expectedResponse;

        this._expectFn = expectFn;
        this._doneFn = doneFn;
    }

    // Public Functions
    startListening() {
        this._core.on(CORE_EVENT, this._handleCoreEvents.bind(this));
    }
    // Public Functions: END

    // Private Functions
    async _handleCoreEvents(event: any): Promise<void> {
        if (event.type === UI.REQUEST_UI_WINDOW) {
            this._core.handleMessage({ event: UI_EVENT, type: POPUP.HANDSHAKE }, true);
        }

        if (event.type === UI.REQUEST_PERMISSION) {
            const payload = {
                remember: true,
                granted: true,
            };
            this._core.handleMessage({ event: UI_EVENT, type: UI.RECEIVE_PERMISSION, payload }, true);
        }

        if (event.type === RESPONSE_EVENT) {
            // console.warn(event);
            this._compareExpectedResponseToActual(this._expectedResponse, event);
            this._doneFn();
        }

        if (this._isEmulatorRunning) {
            if (event.type === DEVICE.CONNECT && event.payload.path === 'emulator21324' && event.payload.features) {
                this._core.handleMessage({
                    type: 'iframe_call',
                    id: 1,
                    payload: { ...this._payload, device: { path: 'emulator21324' } },
                }, true);
            }

            if (event.type === DEVICE.CHANGED &&
                event.payload.path === 'emulator21325' &&
                this._isHandlingButtonRequest) {
                try {
                    setTimeout(async () => {
                        this._isHandlingButtonRequest = false;
                        const { session } = await this._getDebugLinkInfo();
                        this._pressButtonYes(session);
                    }, 501);
                } catch (error) {
                    console.error('Error on device changed event', [error, event]);
                }
            }

            // if (event.type === UI.REQUEST_PASSPHRASE) {
            //     // Send empty passphrase if requested
            //     setTimeout(() => {
            //         const passphrase = '';
            //         const messagePayload = {
            //             save: false,
            //             value: passphrase,
            //         };
            //         this._core.handleMessage({ event: UI_EVENT, type: UI.RECEIVE_PASSPHRASE, payload: messagePayload }, true);
            //     }, 501)
            // }

            if (event.type === UI.REQUEST_BUTTON) {
                try {
                    this._isHandlingButtonRequest = true;
                    const { session, path } = await this._getDebugLinkInfo();
                    this._acquireDevice(session, path);
                } catch (error) {
                    console.error('Error on request button event', [error, event]);
                }
            }

            // if (event.type === DEVICE.CHANGED && this._isHandlingButtonRequest) {
            //     console.warn('WILL PRESS BUTTON');
            //     const { session } = await this._getDebugLinkInfo();
            //     this._pressButtonYes(session);
            // }

            // if (event.type === UI.REQUEST_BUTTON) {
            //     setTimeout(async () => {
            //         this._isHandlingButtonRequest = true;
            //         const { session, path } = await this._getDebugLinkInfo();
            //         console.warn('WILL ACQUIRE');
            //         this._acquireDevice(session, path);
            //     }, 501);
            // }
        } else {
            if (event.type === DEVICE.CONNECT && event.payload.features) {
                this._core.handleMessage({
                    type: 'iframe_call',
                    id: 1,
                    payload: { ...this._payload },
                }, true);
            }
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

    async _getDebugLinkInfo(): Promise<any> {
        try {
            let session: number | string = 'null';
            let path = '';
            const devices: Array<any> = JSON.parse(await this._httpPost(this._urlEnumerate));
            devices.forEach(d => {
                if (d.path === 'emulator21325') {
                    session = d.session;
                    path = d.path;
                }
            });
            return { session, path };
        } catch (error) {
            throw error;
        }
    }

    async _pressButtonYes(session: number | string): Promise<any> {
        const protoButtonPressYes = '0064000000020801';
        try {
            if (session !== 'null') {
                await this._callMethod(session, protoButtonPressYes);
            } else {
                throw new Error('Cannot call method when session is null');
            }
        } catch (error) {
            throw error;
        }
    }

    async _swipeDown(session: number | string): Promise<any> {
        const protoSwipeDown = '0064000000021000';
        try {
            if (session !== 'null') {
                await this._callMethod(session, protoSwipeDown);
            } else {
                throw new Error('Cannot call method when session is null - unacquired device');
            }
        } catch (error) {
            throw error;
        }
    }

    async _acquireDevice(session: number | string, path: string): Promise<any> {
        return this._httpPost(this._urlAcquire(path, session));
    }

    async _callMethod(session: number | string, encodedMethod: string): Promise<any> {
        return this._httpPost(this._urlCall(session), encodedMethod);
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

export const testReporter: Reporter = {
    suiteStarted(result) {
        console.log(`Test: ${result.description}`);
        currentSuite = result.description;
    },
    specStarted(result) {
        console.log(`- Running ${result.description} ...`);
    },
    specDone(result) {
        TestResults.incrementTotalSpecs();

        if (result.status === 'passed') {
            TestResults.incrementPassedSpecs();
        } else if (result.status === 'failed') {
            TestResults.incrementFailedSpecs();
            TestResults.addFailedSpecResult(currentSuite, result.description);
        }
        console.log(`\t ${result.status.toUpperCase()}`);
    },
    jasmineDone() {
        TestResults.show();
    },
};

class FailedSpecResult {
    suiteName: string;
    specDescription: string;

    constructor(suiteName: string, specDescription: string) {
        this.suiteName = suiteName;
        this.specDescription = specDescription;
    }
}

class TestResults {
    static _failedSpecResults: Array<FailedSpecResult> = [];

    static _totalSpecs = 0;
    static _failedSpecs = 0;
    static _passedSpecs = 0;

    static addFailedSpecResult(suiteName: string, specDescription: string) {
        const failedSpecResult = new FailedSpecResult(suiteName, specDescription);
        this._failedSpecResults.push(failedSpecResult);
    }

    static show() {
        const delimiterLength = 100;
        const delimiterEq = '='.repeat(delimiterLength);
        const delimiterLine = '¯'.repeat(delimiterLength);

        console.log(delimiterEq);

        console.log(`Total: ${this._totalSpecs}`);
        console.log(`- Failed: ${this._failedSpecs}`);
        console.log(`- Passed: ${this._passedSpecs}`);
        console.log(delimiterLine);

        if (this._failedSpecResults.length > 0) {
            console.log('FOLLOWING TESTS FAILED');
            this._failedSpecResults.forEach(failedSpecResult => {
                const desc = `${failedSpecResult.suiteName} ${failedSpecResult.specDescription}`.padEnd(80, '.');
                console.log(`${desc}FAILED`);
            });
        } else {
            console.log('ALL TESTS PASSED');
        }

        console.log(delimiterEq);
    }

    static incrementTotalSpecs() {
        this._totalSpecs += 1;
    }

    static incrementFailedSpecs() {
        this._failedSpecs += 1;
    }

    static incrementPassedSpecs() {
        this._passedSpecs += 1;
    }
}
