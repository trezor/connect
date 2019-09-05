/* @flow */

import { Core } from '../../js/core/Core.js';

import * as POPUP from '../../js/constants/popup';
import { CORE_EVENT, RESPONSE_EVENT, UI_EVENT } from '../../js/constants';
import * as UI from '../../js/constants/ui';
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

        // ignore debugLinkDecision response
        if (event.payload.debugLink) return;

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
        // if (!event.payload.features) {
        //     return;
        // }
        const testPayload = this._getCurrentPayload();
        let state: string = testPayload.state;
        if (!state) {
            state = '';
        }
        this._callCoreMessage(testPayload, state);
    }

    async _handleCoreEvents(event: any): Promise<void> {
        switch (event.type) {
            case UI.REQUEST_UI_WINDOW:
                this._handleUiWindowRequest();
                break;

            case UI.REQUEST_CONFIRMATION:
                this._core.handleMessage({ event: UI_EVENT, type: UI.RECEIVE_CONFIRMATION, payload: true }, true);
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
        }

        if (event.type === UI.REQUEST_BUTTON) {
            this._core.handleMessage({
                type: IFRAME.CALL,
                id: -1,
                payload: {
                    method: 'debugLinkDecision',
                    device: event.payload.device,
                    yes_no: true,
                    // up_down: false, // from 2.1.1 there is no need to swipe, TODO: make compatible with older fw!
                },
            }, true);
        }
    }
    // Event handlers: END
}
