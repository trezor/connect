import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';

import { settings, AbstractCoreEventHandler } from './common.js';

class EthereumGetAddressHandler extends AbstractCoreEventHandler {
    expectedAddress: string;
    done: any;

    constructor(core: Core, payload: any, expectedAddress: string, done: any) {
        super(core, payload);
        this.expectedAddress = expectedAddress;
        this.done = done;
    }

    handleResponseEvent(event: any): void {
        if (event.payload.address) {
            expect(event.payload.address).toEqual(this.expectedAddress);
            this.done();
        }
    }
}

export const ethereumGetAddressTests = () => {
    describe('EthereumGetAddress', () => {
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

        const expectedAddresses: Array<string> = [
            '1d1c328764a41bda0492b66baa30c4a339ff85ef',
            '437207ca3cf43bf2e47dea0756d736c5df4f597a',
            'e5d96dfa07bcf1a3ae43677840c31394258861bf',
            'f68804ac9eca9483ab4241d3e4751590d2c05102',
            '7a6366ecfcaf0d5dcc1539c171696c6cdd1eb8ed',
        ];
        const paths: Array<Array<number>> = [
            [],
            [1],
            [0, -1],
            [-9, 0],
            [0, 9999999],
        ];

        if (expectedAddresses.length !== paths.length) {
            throw new Error('Different number of expected addresses and paths to test');
        }

        for (let i = 0; i < expectedAddresses.length; i++) {
            const expectedAddress = expectedAddresses[i];
            const path = paths[i];

            it(`for derivation path: "[${path}]"`, async (done) => {
                const payload = {
                    method: 'ethereumGetAddress',
                    path,
                };

                const handler = new EthereumGetAddressHandler(core, payload, expectedAddress, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};