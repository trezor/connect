/* @flow */

import { Core } from '../../js/core/Core.js';
import { httpPost } from './common.js';

import * as POPUP from '../../js/constants/popup';
import { CORE_EVENT, RESPONSE_EVENT, UI_EVENT } from '../../js/constants';
import * as UI from '../../js/constants/ui';
import * as DEVICE from '../../js/constants/device';
import * as IFRAME from '../../js/constants/iframe';

import type {
    TestPayload,
    ExpectedResponse,
} from 'flowtype/tests';

export class CoreEventHandler {
    _core: Core;
    _payload: Array<TestPayload> | TestPayload;
    _expectedResponse: Array<ExpectedResponse> | ExpectedResponse;

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

    // Signals whether '_doneFn' should be called when RESPONSE_EVENT for the last payload is fired
    // if true then both '_payload' and '_expectedResponse' must be arrays
    _shouldWaitForLastResponse = false;

    _responseIndex = 0;
    _finishResponseIndex = 0;

    constructor(core: Core, expectFn: ExpectFn, doneFn: DoneFn) {
        this._core = core;
        this._expectFn = expectFn;
        this._doneFn = doneFn;
    }

    // Public Functions
    setPayloads(
        testPayload: Array<TestPayload> | TestPayload,
        expectedResponse: Array<ExpectedResponse> | ExpectedResponse,
        shouldWaitForLastResponse: boolean) {
        if (shouldWaitForLastResponse) {
            if (!Array.isArray(testPayload) || !Array.isArray(expectedResponse)) {
                throw new Error('CoreEventHandler should wait for the last response but either testPayload or expectedResponse isn\'t an array');
            }
            this._finishResponseIndex = testPayload.length - 1;
        } else {
            if (Array.isArray(testPayload) || Array.isArray(testPayload)) {
                throw new Error('CoreEventHandler should not wait for the last response but either testPayload or expectedResponse is an array');
            }
        }

        this._shouldWaitForLastResponse = shouldWaitForLastResponse;
        this._payload = testPayload;
        this._expectedResponse = expectedResponse;
    }

    startListening() {
        this._core.on(CORE_EVENT, this._handleCoreEvents.bind(this));
    }
    // Public Functions: END

    _getCurrentPayload(): TestPayload {
        return this._shouldWaitForLastResponse ? this._payload[this._responseIndex] : this._payload;
    }

    _getCurrentExpectedResponse(): TestPayload {
        return this._shouldWaitForLastResponse ? this._expectedResponse[this._responseIndex] : this._expectedResponse;
    }

    _callCoreMessage(message: Object, state: string, isEmulator: boolean = false) {
        let payload: Object;
        if (isEmulator) {
            payload = { ...message, device: { path: 'emulator21324', state } };
        } else {
            payload = message;
        }

        this._core.handleMessage({
            type: IFRAME.CALL,
            id: 1,
            payload,
        }, true);
    }

    _compareExpectedResponseToActual(expected: any, actual: any): void {
        // 'expected' keys (and associated types) must be a subset (or same set) of 'actual' keys
        // i.e. 'expected' is the ancestor of the 'actual'
        // this function doesn't compare whether two objects have same keys
        // the premise is that both objects have same keys but may have different values
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

    // Event handlers
    _handleUiWindowRequest() {
        this._core.handleMessage({ event: UI_EVENT, type: POPUP.HANDSHAKE }, true);
    }

    _handlePassphraseRequest(passphrase: string) {
        setTimeout(() => {
            const messagePayload = {
                save: false,
                value: passphrase,
            };

            this._core.handleMessage({
                event: UI_EVENT,
                type: UI.RECEIVE_PASSPHRASE,
                payload: messagePayload,
            }, true);
        }, 501);
    }

    _handleResponseEvent(event: Object) {
        console.warn(event);

        if (this._shouldWaitForLastResponse) {
            // TODO: Do something with the intermediate response
        }

        if (this._responseIndex < this._finishResponseIndex) {
            this._responseIndex += 1;

            // Call core message with the next payload
            const nextTestPayload = this._getCurrentPayload;
            let state = nextTestPayload.state;
            if (!state) {
                state = '';
            }

            // TODO: payload format would have to be changed?
            // this._callCoreMessage(nextTestPayload.payload, state);
            this._callCoreMessage(nextTestPayload, state);
        } else {
            const expectedResponse = this._getCurrentExpectedResponse();
            this._compareExpectedResponseToActual(expectedResponse, event);
            this._doneFn();
        }
    }

    _handleDeviceConnect(event: Object, isEmulatorRunning: boolean) {
        // No features mean that we still don't whether it's a Trezor device
        if (!event.payload.features) {
            return;
        }

        // If emulator is running communicate only with the emulator device
        // TODO: fix this when excludedDevices will work
        if (isEmulatorRunning) {
            if (event.payload.path === 'emulator21324') {
                const testPayload = this._getCurrentPayload();
                let state: string = testPayload.state;
                if (!state) {
                    state = '';
                }

                // TODO: payload format would have to be changed?
                // this._callCoreMessage(testPayload.payload, state);
                this._callCoreMessage(testPayload, state, true);
            }
        } else {
            const testPayload = this._getCurrentPayload();
            let state: string = testPayload.state;
            if (!state) {
                state = '';
            }

            // TODO: payload format would have to  be changed?
            // this._callCoreMessage(testPayload.payload, state);
            this._callCoreMessage(testPayload, state);
        }
    }

    async _handleCoreEvents(event: any): Promise<void> {
        switch (event.type) {
            case UI.REQUEST_UI_WINDOW:
                this._handleUiWindowRequest();
                break;

            case UI.REQUEST_PASSPHRASE: {
                let passphrase = this._getCurrentPayload().passphrase;
                if (!passphrase) {
                    // Use empty passphrase by default
                    passphrase = '';
                }

                this._handlePassphraseRequest(passphrase);
                break;
            }

            case RESPONSE_EVENT:
                this._handleResponseEvent(event);
                break;

            case DEVICE.CONNECT:
                this._handleDeviceConnect(event, this._isEmulatorRunning);
                break;
        }

        if (event.type === DEVICE.CHANGED &&
            event.payload.path === 'emulator21325' &&
            this._isHandlingButtonRequest) {
            try {
                setTimeout(async () => {
                    this._isHandlingButtonRequest = false;
                    const { session } = await this._enumerate();
                    this._pressButtonYes(session);
                }, 501);
            } catch (error) {
                console.error('Error on device changed event', [error, event]);
            }
        }

        if (event.type === UI.REQUEST_BUTTON) {
            try {
                this._isHandlingButtonRequest = true;
                const { session, path } = await this._enumerate();
                this._acquireDevice(session, path);
            } catch (error) {
                console.error('Error on request button event', [error, event]);
            }
        }
    }
    // Event handlers: END

    // Debug link communication
    async _enumerate(): Promise<any> {
        try {
            let session: number | string = 'null';
            let path = '';
            const devices: Array<any> = JSON.parse(await httpPost(this._urlEnumerate));
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
                await this._callDeviceMethod(session, protoButtonPressYes);
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
                await this._callDeviceMethod(session, protoSwipeDown);
            } else {
                throw new Error('Cannot call method when session is null - unacquired device');
            }
        } catch (error) {
            throw error;
        }
    }

    async _acquireDevice(session: number | string, path: string): Promise<any> {
        return httpPost(this._urlAcquire(path, session));
    }

    async _callDeviceMethod(session: number | string, encodedMethod: string): Promise<any> {
        return httpPost(this._urlCall(session), encodedMethod);
    }
    // Debug link communication: END
}
