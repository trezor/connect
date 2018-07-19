/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { getSerializedPath } from '../../js/utils/pathUtils.js';

import type {
    TestEthereumGetAddressPayload,
    ExpectedEthereumGetAddressResponse,
} from 'flowtype/tests/ethereum-get-address';

export const ethereumGetAddress = () => {
    describe('EthereumGetAddress', () => {
        let core: Core;
        const testPayloads: Array<TestEthereumGetAddressPayload> = [
            {
                method: 'ethereumGetAddress',
                path: "m/44'/43'/0'",
            },
            {
                method: 'ethereumGetAddress',
                path: [2147483692, 2147483691, 2147483648],
            },
            {
                method: 'ethereumGetAddress',
                path: "m/44'/43'/1'",
            },
            {
                method: 'ethereumGetAddress',
                path: [-1],
            },
            {
                method: 'ethereumGetAddress',
                path: [0, 1],
            },
        ];


        const expectedResponses: Array<ExpectedEthereumGetAddressResponse> = [
            {
                payload: {
                    address: '6ae2f16e73aeac6a2bbc46cc98a1d2e23661e6fe',
                },
            },
            {
                payload: {
                    address: '6ae2f16e73aeac6a2bbc46cc98a1d2e23661e6fe',
                },
            },
            {
                payload: {
                    address: '64c97f1954602ef09b950aba4b0d172ace043392',
                },
            },
            { success: false },
            { success: false },
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

            it(`for derivation path: [${payload.path.toString()}]`, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};