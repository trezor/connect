/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

export const ethereumVerifyMessage = () => {
    describe('EthereumVerifyMessage', () => {
        let core: Core;

        const testPayloads = [
            {
                method: 'ethereumVerifyMessage',
                address: 'cb3864960e8db1a751212c580af27ee8867d688f',
                signature: 'b7837058907192dbc9427bf57d93a0acca3816c92927a08be573b785f2d72dab65dad9c92fbe03a358acdb455eab2107b869945d11f4e353d9cc6ea957d08a871b',
                message: 'This is an example of a signed message.',
            },
            {
                method: 'ethereumVerifyMessage',
                address: 'cb3864960e8db1a751212c580af27ee8867d688f',
                signature: 'da2b73b0170479c2bfba3dd4839bf0d67732a44df8c873f3f3a2aca8a57d7bdc0b5d534f54c649e2d44135717001998b176d3cd1212366464db51f5838430fb31c',
                message: 'VeryLongMessage!'.repeat(64),
            },
        ];
        const expectedResponses = [
            { success: true },
            { success: true },
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

            it(`that response is successful for message: "${payload.message}"`, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};