/* todo: flow */
/* eslint-disable */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { settings, CoreEventHandler } from './common.js';

export const stellarGetPublicKeyTests = (): void => {
    describe('StellarGetPublicKey', () => {
        let core: Core;

        beforeEach(async (done) => {
            core = await initCore(settings);
            done();
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        const testPayloads = [
            {
                method: 'stellarGetPublicKey',
                path: 'm/44h/148h/0h',
            },
        ];
        const expectedResponses = [
            {
                payload: {
                    todo: 'check python'
                    // assert stellar.address_from_public_key(response.public_key) == b'GAK5MSF74TJW6GLM7NLTL76YZJKM2S4CGP3UH4REJHPHZ4YBZW2GSBPW'
                },
            },
        ];

        if (testPayloads.length !== expectedResponses.length) {
            throw new Error('Different number of payloads and expected responses');
        }

        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];

            it('', async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};
