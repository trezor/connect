import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import { settings, mnemonic, callMethod } from './common.js';


export const ethereumGetAddressTests = () => {
    describe('EthereumGetAddress', () => {
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

        const handleEthereumGetAddress = (core: Core, expectedAddress: string, event: any, path: string | Array<number>, done: any) => {
            const eventType = event.type;
            if (eventType === 'device__connect') {
                // Call the desired device method here
                const payload = {
                    method: 'ethereumGetAddress',
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
                expect(event.payload.address).toEqual(expectedAddress);
                core.onBeforeUnload();
                done();
            }
        };

        it('for derivation path: "[]"', async (done) => {
            const expectedAddress = '1d1c328764a41bda0492b66baa30c4a339ff85ef';
            core.on('CORE_EVENT', (event) => handleEthereumGetAddress(core, expectedAddress, event, [], done));
            await initTransport(settings);
        });

        it('for derivation path: "[1]"', async (done) => {
            const expectedAddress = '437207ca3cf43bf2e47dea0756d736c5df4f597a';
            core.on('CORE_EVENT', (event) => handleEthereumGetAddress(core, expectedAddress, event, [1], done));
            await initTransport(settings);
        });

        it('for derivation path: "[0, -1]"', async (done) => {
            const expectedAddress = 'e5d96dfa07bcf1a3ae43677840c31394258861bf';
            core.on('CORE_EVENT', (event) => handleEthereumGetAddress(core, expectedAddress, event, [0, -1], done));
            await initTransport(settings);
        });

        it('for derivation path: "[-9, 0]"', async (done) => {
            const expectedAddress = 'f68804ac9eca9483ab4241d3e4751590d2c05102';
            core.on('CORE_EVENT', (event) => handleEthereumGetAddress(core, expectedAddress, event, [-9, 0], done));
            await initTransport(settings);
        });

        it('for derivation path: "[0, 9999999]"', async (done) => {
            const expectedAddress = '7a6366ecfcaf0d5dcc1539c171696c6cdd1eb8ed';
            core.on('CORE_EVENT', (event) => handleEthereumGetAddress(core, expectedAddress, event, [0, 9999999], done));
            await initTransport(settings);
        });
    });
};