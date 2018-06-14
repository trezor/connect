import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import { settings, callMethod } from './common.js';


export const getPublicKeyTests = (): void => {
    describe(`GetPublicKey`, () => {
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

        const handleGetPublicKey = (core: Core, expectedXpub: string, event: any, path: string | Array<number>, done: any) => {
            const eventType = event.type;
            if (eventType === 'device__connect') {
                // Call the desired device method here
                const payload = {
                    method: 'getPublicKey',
                    path,
                    useEmptyPassphrase: true,
                    showOnTrezor: false,
                };
                callMethod(core, payload);
            }

            if (eventType === UI.REQUEST_UI_WINDOW) {
                core.handleMessage({ event: 'UI_EVENT', type: POPUP.HANDSHAKE }, true);
                return;
            }

            if (eventType === 'RESPONSE_EVENT') {
                expect(event.payload.xpub).toEqual(expectedXpub);
                core.onBeforeUnload();
                done();
            }
        };

        it('for derivation path: "[]"', async (done) => {
            const expectedXpub = 'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy';
            core.on('CORE_EVENT', (event) => handleGetPublicKey(core, expectedXpub, event, [], done));

            await initTransport(settings);
        });
        it('for derivation path: "[1]"', async (done) => {
            const expectedXpub = 'xpub68zNxjsTrV8y9AadThLW7dTAqEpZ7xBLFSyJ3X9pjTv6Njg6kxgjXJkzxq8u3ttnjBw1jupQHMP3gpGZzZqd1eh5S4GjkaMhPR18vMyUi8N';
            core.on('CORE_EVENT', (event) => handleGetPublicKey(core, expectedXpub, event, [1], done));
            await initTransport(settings);
        });

        it('for derivation path: "[0, -1]"', async (done) => {
            const expectedXpub = 'xpub6A3FoZqYXj1AbW4thRwBh26YwZWbmoyjTaZwwxJjY1oKUpefLepL3RFS9DHKQrjAfxDrzDepYMDZPqXN6upQm3bHQ9xaXD5a3mqni3goF4v';
            core.on('CORE_EVENT', (event) => handleGetPublicKey(core, expectedXpub, event, [0, -1], done));
            await initTransport(settings);
        });

        it('for derivation path: "[-9, 0]"', async (done) => {
            const expectedXpub = 'xpub6A2h5mzLDfYginoD7q7wCWbq18wTbN9gducRr2w5NRTwdLeoT3cJSwefFqW7uXTpVFGtpUyDMBNYs3DNvvXx6NPjF9YEbUQrtxFSWnPtVrv';
            core.on('CORE_EVENT', (event) => handleGetPublicKey(core, expectedXpub, event, [-9, 0], done));
            await initTransport(settings);
        });

        it('for derivation path: "[0, 9999999]"', async (done) => {
            const expectedXpub = 'xpub6A3FoZqQEK6iwLZ4HFkqSo5fb35BH4bpjC4SPZ63prfLdGYPwYxEuC6o91bUvFFdMzKWe5rs3axHRUjxJaSvBnKKFtnfLwDACRxPxabsv2r';
            core.on('CORE_EVENT', (event) => handleGetPublicKey(core, expectedXpub, event, [0, 9999999], done));
            await initTransport(settings);
        });
    });
};
