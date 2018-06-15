import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import { settings, AbstractCoreEventHandler } from './common.js';

class GetPublicKeyHandler extends AbstractCoreEventHandler {
    expectedXpub: string;
    done: any;

    constructor(core: Core, payload: any, expectedXpub: string, done: any) {
        super(core, payload);
        this.expectedXpub = expectedXpub;
        this.done = done;
    }

    handleResponseEvent(event: any): void {
        if (event.payload.xpub) {
            expect(event.payload.xpub).toEqual(this.expectedXpub);
            this.done();
        }
    }
}


export const getPublicKeyTests = (): void => {
    describe(`GetPublicKey`, () => {
        let core: Core;

        beforeEach(async (done) => {
            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        const expectedXpubs: Array<string> = [
            'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy',
            'xpub68zNxjsTrV8y9AadThLW7dTAqEpZ7xBLFSyJ3X9pjTv6Njg6kxgjXJkzxq8u3ttnjBw1jupQHMP3gpGZzZqd1eh5S4GjkaMhPR18vMyUi8N',
            'xpub6A3FoZqYXj1AbW4thRwBh26YwZWbmoyjTaZwwxJjY1oKUpefLepL3RFS9DHKQrjAfxDrzDepYMDZPqXN6upQm3bHQ9xaXD5a3mqni3goF4v',
            'xpub6A2h5mzLDfYginoD7q7wCWbq18wTbN9gducRr2w5NRTwdLeoT3cJSwefFqW7uXTpVFGtpUyDMBNYs3DNvvXx6NPjF9YEbUQrtxFSWnPtVrv',
            'xpub6A3FoZqQEK6iwLZ4HFkqSo5fb35BH4bpjC4SPZ63prfLdGYPwYxEuC6o91bUvFFdMzKWe5rs3axHRUjxJaSvBnKKFtnfLwDACRxPxabsv2r',
        ];
        const paths: Array<Array<number>> = [
            [],
            [1],
            [0, -1],
            [-9, 0],
            [0, 9999999],
        ];

        if (expectedXpubs.length !== paths.length) {
            throw new Error('Different number of expected addresses and paths to test');
        }


        for (let i = 0; i < expectedXpubs.length; i++) {
            const expectedXpub = expectedXpubs[i];
            const path = paths[i];

            it(`for derivation path: "[${path}]"`, async (done) => {
                const payload = {
                    method: 'getPublicKey',
                    coin: 'btc',
                    path,
                };

                const handler = new GetPublicKeyHandler(core, payload, expectedXpub, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};
