import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import { settings, callMethod } from './common.js';


export const ethereumSignMessageTests = () => {
    describe('EthereumSignMessage', () => {
        let core: Core;

        let defaultTimeout;
        beforeEach(async (done) => {
            defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 25000;

            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        const handleEthereumSignMessage = (core: Core, expectedAddr: string, expectedSig: string, messageToSign: string, path: string, event: any, done: any) => {
            const eventType = event.type;
            if (eventType === 'device__connect') {
                // Call the desired device method here
                const payload = {
                    method: 'ethereumSignMessage',
                    message: messageToSign,
                    path,
                    useEmptyPassphrase: true,
                };
                callMethod(core, payload);
            }

            if (eventType === UI.REQUEST_UI_WINDOW) {
                core.handleMessage({ event: 'UI_EVENT', type: POPUP.HANDSHAKE }, true);
                return;
            }

            if (eventType === 'RESPONSE_EVENT') {
                console.warn(event.payload);
                expect(event.payload.address).toEqual(expectedAddr);
                expect(event.payload.signature).toEqual(expectedSig);
                core.onBeforeUnload();
                done();
            }
        };


        const config = {
            path: [0],
            address: 'cb3864960e8db1a751212c580af27ee8867d688f',
            vectors: [
                {
                    msg: 'This is an example of a signed message.',
                    sig: 'b7837058907192dbc9427bf57d93a0acca3816c92927a08be573b785f2d72dab65dad9c92fbe03a358acdb455eab2107b869945d11f4e353d9cc6ea957d08a871b',
                },
                {
                    msg: 'VeryLongMessage!'.repeat(64),
                    sig: 'da2b73b0170479c2bfba3dd4839bf0d67732a44df8c873f3f3a2aca8a57d7bdc0b5d534f54c649e2d44135717001998b176d3cd1212366464db51f5838430fb31c'
                },
            ],
        }

        config.vectors.forEach(v => {
            it(`for path: "${config.path}"`, async (done) => {
                const expectedAddr: string = config.address;
                const messageToSign: string = v.msg;
                const expectedSig: string = v.sig;

                core.on('CORE_EVENT', (event) => handleEthereumSignMessage(core, expectedAddr, expectedSig, messageToSign, config.path, event, done));
                await initTransport(settings);
            });
        });

    });
};
