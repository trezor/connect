/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { describe, beforeEach, afterEach, it, expect } from 'flowtype/jasmine';

import {
    TestAddressPayload,
    ExpectedAddressResponse,
} from 'flowtype/tests';

export const ethereumGetAddress = () => {
    describe('EthereumGetAddress', () => {
        let core: Core;

        const testPayloads: Array<TestAddressPayload> = [
            {
                method: 'ethereumGetAddress',
                path: [],
            },
            {
                method: 'ethereumGetAddress',
                path: [1],
            },
            {
                method: 'ethereumGetAddress',
                path: [0, -1],
            },
            {
                method: 'ethereumGetAddress',
                path: [-9, 0],
            },
            {
                method: 'ethereumGetAddress',
                path: [0, 9999999],
            },
        ];


        const expectedResponses: Array<ExpectedAddressResponse> = [
            {
                payload: {
                    address: '1d1c328764a41bda0492b66baa30c4a339ff85ef',
                },
            },
            {
                payload: {
                    address: '437207ca3cf43bf2e47dea0756d736c5df4f597a',
                },
            },
            {
                payload: {
                    address: 'e5d96dfa07bcf1a3ae43677840c31394258861bf',
                },
            },
            {
                payload: {
                    address: 'f68804ac9eca9483ab4241d3e4751590d2c05102',
                },
            },
            {
                payload: {
                    address: '7a6366ecfcaf0d5dcc1539c171696c6cdd1eb8ed',
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

            it(`for derivation path: [${payload.path.toString()}]`, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};