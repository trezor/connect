/* TODO: flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import * as POPUP from '../../js/constants/popup';
import { CORE_EVENT, RESPONSE_EVENT, UI_EVENT } from '../../js/constants';
import * as DEVICE from '../../js/constants/device';
import * as UI from '../../js/constants/ui';

import { UiMessage } from '../../js/message/builder';
import { postMessage } from '../../js/popup/view/common';

import type {
    SubtestPassphrase,
    PassphraseAvailableSubtests,
} from 'flowtype/tests';
import type {
    TestPassphrasePayload,
    ExpectedPassphraseResponse,
} from 'flowtype/tests/passphrase';

class CustomCoreEventHandler extends CoreEventHandler {

    _responseIndex = 0;
    _payloads: any;
    _expectedResponses: any;

    constructor(core: Core, payloads: any, expectedResponses: any, expectFn: any, doneFn: any) {
        super(core, {}, {}, expectFn, doneFn);

        this._payloads = payloads;
        this._expectedResponses = expectedResponses;
    }

    async _handleCoreEvents(event: any): Promise<void> {
        if (event.type === DEVICE.CONNECT && event.payload.path === 'emulator21324' && event.payload.features) {
            const currentPayload = this._payloads[this._responseIndex].message;
            const currentState = this._payloads[this._responseIndex].state;
            this._callCoreXpub(currentPayload, currentState);
        }

        if (event.type === UI.REQUEST_UI_WINDOW) {
            this._core.handleMessage({ event: UI_EVENT, type: POPUP.HANDSHAKE }, true);
        }

        if (event.type === UI.REQUEST_PASSPHRASE) {
            setTimeout(() => {
                const passphrase = this._payloads[this._responseIndex].passphrase;
                const messagePayload =  {
                    save: false,
                    value: passphrase,
                };
                // const currentState = this._payloads[this._responseIndex].state;
                this._core.handleMessage({ event: UI_EVENT, type: UI.RECEIVE_PASSPHRASE, payload: messagePayload }, true);
            }, 501)
        }

        if (event.type === RESPONSE_EVENT) {
            console.warn(event);
            let currentExpectedResponse = this._expectedResponses[this._responseIndex];
            this._compareExpectedResponseToActual(currentExpectedResponse, event);

            this._responseIndex += 1;
            if (this._responseIndex <= this._payloads.length - 1) {
                const currentPayload = this._payloads[this._responseIndex].message;
                const currentState = this._payloads[this._responseIndex].state;
                this._callCoreXpub(currentPayload, currentState);
            } else {
                // this._doneFn();
            }
        }
    }

    _callCoreXpub(payload, state) {
        let message = {
            type: 'iframe_call',
            id: 1,
            payload: { ...payload, device: { path: 'emulator21324', state } },
        };
        this._core.handleMessage(message, true);
    }

    _callCorePassphrase(state) {
        // this._core
    }
}

const correctPassphrase = (): SubtestPassphrase => {
    let testPayloads: Array<TestPassphrasePayload> = [
        {
            message: {
                method: 'getPublicKey',
                coin: 'btc',
                path: [],
            },
            passphrase: 'A',
            state: '4045dc2136501ca862d6c86d1b100f045f2eb555727249f7a69386c99fccf34611559a12f4a24043346422b6b21be49b9a08c45f4c8aea47e649fd5b4d604d2f'
        },
    ];

    let expectedResponses: Array<ExpectedPassphraseResponse> = [
        {
            payload: {
                xpub: 'xpub661MyMwAqRbcGSFnGhvj2yEs3HapBbJExFT7GRG4V83a8ECibmzmJHBaJrdTvQKhgaPxC1A53M7NLKCKG6uF9RYairavkNeXXarGLY68EZ9',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/correct',
    };
};

const wrongPassphrase = (): SubtestPassphrase => {
    let testPayloads: Array<TestPassphrasePayload> = [
        {
            message: {
                method: 'getPublicKey',
                coin: 'btc',
                path: [],
            },
            passphrase: 'A',
            // Wrong state for the given passphrase
            state: '84e021b0b9dd8b8ae530341c5e8cf58a0969e352f0be91a3c74c3543731f2611e2d7785bdc6ec14485cea2812bffb38a9d6ca31ce1e7fd327a172b22c66b5627'
        },
    ];

    let expectedResponses: Array<ExpectedPassphraseResponse> = [
        {
            success: false
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/wrong',
    };
};

/* const contexts = () => {

}; */

export const passphrase = () => {
    const availableSubtests = {
        correctPassphrase,
        wrongPassphrase,
        /* contexts, */
    }

    describe('Passphrase Context', () => {
        let core: Core;
        beforeEach(async (done) => {
            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            core.onBeforeUnload();
        });

        const { testPayloads, expectedResponses, specName } = availableSubtests[subtest]();
        if (testPayloads.length !== expectedResponses.length) {
            throw new Error('Different number of payloads and expected responses');
        }

        it(specName, async (done) => {
            const handler = new CustomCoreEventHandler(core, testPayloads, expectedResponses, expect, done);
            handler.startListening();
            await initTransport(settings);
        });
    });
};