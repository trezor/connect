/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { NEM_MAINNET, NEM_TESTNET } from '../../js/core/methods/helpers/nemSignTx.js'
import { settings, CoreEventHandler } from './common.js';

import { describe, beforeEach, afterEach, it, expect } from 'flowtype/jasmine';

import {
    type TestAddressPayload,
    type ExpectedAddressResponse,
} from 'flowtype/tests/get-address';

export const nemGetAddress = () => {
    describe('NEMGetAddress', () => {
        let core: Core;

        const testPayloads: Array<TestAddressPayload> = [
            {
                method: 'nemGetAddress',
                path: "m/44'/1'/0'/0'/0'",
                network: NEM_MAINNET,
            },
            {
                method: 'nemGetAddress',
                path: "m/44'/1'/0'/0'/0'",
                network: NEM_TESTNET,
            },
        ];
        const expectedResponses: Array<ExpectedAddressResponse> = [
            {
                payload: {
                    address: 'NB3JCHVARQNGDS3UVGAJPTFE22UQFGMCQGHUBWQN',
                },
            },
            {
                payload: {
                    address: 'TB3JCHVARQNGDS3UVGAJPTFE22UQFGMCQHSBNBMF',
                },
            },
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

            it(`for path: ${payload.path.toString()}`, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};