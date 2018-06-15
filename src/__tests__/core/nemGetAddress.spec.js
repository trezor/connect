import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';

import { settings, AbstractCoreEventHandler } from './common.js';

class NEMGetAddressHandler extends AbstractCoreEventHandler {
    done: any;
    expectedAddress: string;

    constructor(core: Core, payload: any, expectedAddress: string, done: any) {
        super(core, payload);
        this.expectedAddress = expectedAddress;
        this.done = done;
    }

    handleResponseEvent(event: any): void {
        if (event.payload.address) {
            expect(event.payload.address).toEqual(this.expectedAddress)
            this.done();
        }
    }
}

export const nemGetAddressTests = () => {
    describe('NEMGetAddress', () => {
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

        const config = [
            {
                path: "m/44'/1'/0'/0'/0'",
                network: 0x68,
                expectedAddress: 'NB3JCHVARQNGDS3UVGAJPTFE22UQFGMCQGHUBWQN',
            },
            {
                path: "m/44'/1'/0'/0'/0'",
                network: 0x98,
                expectedAddress: 'TB3JCHVARQNGDS3UVGAJPTFE22UQFGMCQHSBNBMF',
            },
        ];

        config.forEach(c => {
            let networkName: string;
            if (c.network === 0x68) {
                networkName = 'MAINNET';
            } else if (c.network === 0x98) {
                networkName = 'TESTNET';
            } else if (c.network === 0x60) {
                networkName = 'MIJIN';
            } else {
                networkName = 'Unknown Network';
            }

            it(`for path ${c.path} on '${networkName}'`, async (done) => {
                const payload = {
                    method: 'nemGetAddress',
                    path: c.path,
                    network: c.network,
                };

                const handler = new NEMGetAddressHandler(core, payload, c.expectedAddress, done);
                handler.startListening();
                await initTransport(settings);
            });
        });
    });
};