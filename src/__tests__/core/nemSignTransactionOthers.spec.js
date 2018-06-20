import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { TX_TYPES } from '../../js/core/methods/helpers/nemSignTx.js';
import { settings, CoreEventHandler } from './common.js';

const importanceTransferSubtest = (): void => {
    const testPayloads = [
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 12349215,
                fee: 9900,
                type: TX_TYPES.importanceTransfer,
                deadline: 99,
                message: {},
                importanceTransfer: {
                    mode: 1,
                    publicKey: '0xc5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
                },
                version: -1744830464,
            },
        }
    ];
    const expectedResponses = [
        {
            payload: {
                data: '0x01080000010000981f6fbc0020000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b4062084ac26000000000000630000000100000020000000c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
                signature: '0xb6d9434ec5df80e65e6e45d7f0f3c579b4adfe8567c42d981b06e8ac368b1aad2b24eebecd5efd41f4497051fca8ea8a5e77636a79afc46ee1a8e0fe9e3ba90b',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/importanceTransfer',
    };
};

const provisionNamespaceSubtest = (): void => {
    const testPayloads = [
        method: 'nemSignTransaction',
        path: "m/44'/1'/0'/0'/0'",
        transaction: {
            timeStamp: 74649215,
            fee: 2000000,
            type: TX_TYPES.provisionNamespace,
            deadline: 74735615,
            message: {},
            newPart: 'ABCDE',
            rentalFeeSink: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
            rentalFee: 1500,
            /* parent: undefined, */
            version: -1744830464,
        },
    ];
    const expectedResponses = [
        {
            payload: {
                data: '01200000010000987f0e730420000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b406208480841e0000000000ff5f74042800000054414c49434532474d4133344358484437584c4a513533364e4d35554e4b5148544f524e4e54324adc05000000000000050000004142434445ffffffff',
                signature: 'f047ae7987cd3a60c0d5ad123aba211185cb6266a7469dfb0491a0df6b5cd9c92b2e2b9f396cc2a3146ee185ba02df4f9e7fb238fe479917b3d274d97336640d',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/provisionNamespace',
    };
};

export const nemSignTransactionOthersTests = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        importanceTransfer: importanceTransferSubtest,
        provisionNamespace: provisionNamespaceSubtest,
    };

    describe('NEMSignTransactionOthers', () => {
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

        const { testPayloads, expectedResponses, specName } = availableSubtests[subtest]();
        if (testPayloads.length !== expectedResponses.length) {
            throw new Error('Different number of payloads and expected responses');
        }

        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];

            it(specName, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};