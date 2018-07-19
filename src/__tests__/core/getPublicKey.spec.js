/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import type {
    TestGetPublicKeyPayload,
    ExpectedGetPublicKeyResponse,
} from 'flowtype/tests/get-public-key';

export const getPublicKey = (): void => {
    describe('GetPublicKey', () => {
        let core: Core;

        const testPayloads: Array<TestGetPublicKeyPayload> = [
            {
                method: 'getPublicKey',
                coin: 'btc',
                path: "m/49'/0'/0'",
            },
            {
                method: 'getPublicKey',
                coin: 'btc',
                path: [2147483697, 2147483648, 2147483648],
            },
            {
                method: 'getPublicKey',
                coin: 'btc',
                path: [-1],
            },
            {
                method: 'getPublicKey',
                coin: 'btc',
                path: [0, 1],
            },
        ];
        const expectedResponses: Array<ExpectedGetPublicKeyResponse> = [
            {
                payload: {
                    xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
                },
            },
            {
                payload: {
                    xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
                },
            },
            { success: false, },
            { success: false, },
        ];

        beforeEach(async (done) => {
            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        if (testPayloads.length !== expectedResponses.length) {
            throw new Error('Different number of payloads and expected responses');
        }

        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];

            it(`for derivation path: "[${payload.path.toString()}]"`, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};
