/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { getSerializedPath } from '../../js/utils/pathUtils.js';

import type {
    TestEthereumGetAddressPayload,
    ExpectedEthereumGetAddressResponse,
} from 'flowtype/tests/ethereum-get-address';


export const tronGetAddress = () => {

    describe('TronGetAddress', () => {

        let core: Core;
        const testPayloads = [
            {
                method: 'TronGetAddress',
                path: [],
            },
        ];


        const expectedResponses = [
            {
                payload: {
                    address: '1d1c328764a41bda0492b66baa30c4a339ff85ef',
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

        console.log("PATHLOAY COUNT", testPayloads.length);

        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];
            console.log("SEND", payload, expectedResponse);

            it(`for derivation path: [${payload.path.toString()}]`, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                console.log("GO start");
                handler.startListening();
                console.log("GO DONE");
                await initTransport(settings);
                console.log("INITED");
            });
        }
    });
};
