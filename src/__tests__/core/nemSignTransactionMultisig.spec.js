/* todo: flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { TX_TYPES } from '../../js/core/methods/helpers/nemSignTx.js';
import { settings, CoreEventHandler } from './common.js';

const aggregateModificationSubtest = () => {
    const testPayloads = [
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 74649215,
                fee: 2000000,
                type: TX_TYPES.aggregateModification,
                deadline: 74735615,
                message: {},
                modifications: [
                    {
                        modificationType: 1,
                        cosignatoryAccount: 'c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844'
                    },
                ],
                minCosignatories: {
                    relativeChange: 3
                },
                version: -1744830464,
            },
        },
    ];
    const expectedResponses = [
        {
            payload: {
                data: '01100000020000987f0e730420000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b406208480841e0000000000ff5f740401000000280000000100000020000000c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f878440400000003000000',
                signature: '1200e552d8732ce3eae96719731194abfc5a09d98f61bb35684f4eeaeff15b1bdf326ee7b1bbbe89d3f68c8e07ad3daf72e4c7f031094ad2236b97918ad98601',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/aggregateModification',
    };
};

const multisigSubtest = () => {
    const testPayloads = [
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 1,
                fee: 2000000,
                type: 4100,
                deadline: 74735615,
                otherTrans: {
                    timeStamp: 2,
                        amount: 2000000,
                        fee: 15000,
                        recipient: '0xTALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                        type: TX_TYPES.transfer,
                        deadline: 67890,
                        message: {
                            payload: '0x746573745f6e656d5f7472616e73616374696f6e5f7472616e73666572',
                            type: 1,
                        },
                        version: -1744830464,
                        signer: '0xc5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
                },
                version: -1744830464,
            },
        },
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 74649215,
                fee: 150,
                type: 4100,
                deadline: 789,
                otherTrans: {
                    timeStamp: 2,
                        amount: 123456,
                        fee: 2000,
                        recipient: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                        type: TX_TYPES.provisionNamespace,
                        deadline: 100,
                        message: { },
                        newPart: '0xABCDE',
                        rentalFeeSink: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                        rentalFee: 1500,
                        version: -1744830464,
                        signer: '0xc5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
                },
                version: -1744830464,
            },
        },
    ];
    const expectedResponses = [
        {
            payload: {
                data: '04100000010000980100000020000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b40620841027000000000000ff5f74049900000001010000010000980200000020000000c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844983a000000000000320901002800000054414c49434532474d4133344358484437584c4a513533364e4d35554e4b5148544f524e4e54324a80841e000000000025000000010000001d000000746573745f6e656d5f7472616e73616374696f6e5f7472616e73666572',
                signature: '0cab2fddf2f02b5d7201675b9a71869292fe25ed33a366c7d2cbea7676fed491faaa03310079b7e17884b6ba2e3ea21c4f728d1cca8f190b8288207f6514820a',
            },
        },
        {
            payload: {
                data: '04100000010000987f0e730420000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b40620849600000000000000150300007d000000012000000100009840e2010020000000c5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844d007000000000000640000002800000054414c49434532474d4133344358484437584c4a513533364e4d35554e4b5148544f524e4e54324adc05000000000000050000004142434445ffffffff',
                signature: 'c915ca3332380925f4050301cdc62269cf29437ac5955321b18da34e570c7fdbb1aec2940a2a553a2a5c90950a4db3c8d3ef899c1a108582e0657f66fbbb0b04',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/multisig',
    };
};

const multisigSignerSubtest = () => {
    const testPayloads = [
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 333,
                fee: 200,
                type: 4098,
                deadline: 444,
                otherTrans: {
                    timeStamp: 55,
                    amount: 2000000,
                    fee: 2000000,
                    recipient: '0xTALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                    type: TX_TYPES.transfer,
                    deadline: 666,
                    message: {
                        payload: '0x746573745f6e656d5f7472616e73616374696f6e5f7472616e73666572',
                        type: 1,
                    },
                    version: -1744830464,
                    signer: '0xc5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
                },
                version: -1744830464,
            },
        },
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 900000,
                fee: 200000,
                type: 4098,
                deadline: 100,
                otherTrans: {
                    timeStamp: 101111,
                    fee: 1000,
                    recipient: '0xTALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                    type: TX_TYPES.supplyChange,
                    deadline: 13123,
                    message: { },
                    mosaicID: {
                        namespaceId: 'hellom',
                        name: 'Hello mosaic'
                    },
                    supplyType: 1,
                    delta: 1,
                    version: -1744830464,
                    creationFeeSink: '0xTALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                    creationFee: 1500,
                    signer: '0xc5f54ba980fcbb657dbaaa42700539b207873e134d2375efeab5f1ab52f87844',
                },
                version: -1744830464,
            },
        }
    ];
    const expectedResponses = [
        {
            payload: {
                data: '02100000010000984d01000020000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b4062084c800000000000000bc010000240000002000000087923cd4805f3babe6b5af9cbb2b08be4458e39531618aed73c911f160c8e38528000000544444324354364c514c49595135364b49584933454e544d36454b3344343450354b5a50464d4b32',
                signature: '286358a16ae545bff798feab93a713440c7c2f236d52ac0e995669d17a1915b0903667c97fa04418eccb42333cba95b19bccc8ac1faa8224dcfaeb41890ae807',
            },
        },
        {
            payload: {
                data: '0210000001000098a0bb0d0020000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b4062084400d030000000000640000002400000020000000c51395626a89a71c1ed785fb5974307a049b3b9e2165d56ed0302fe6b4f02a0128000000544444324354364c514c49595135364b49584933454e544d36454b3344343450354b5a50464d4b32',
                signature: '32b1fdf788c4a90c01eedf5972b7709745831d620c13e1e97b0de6481837e162ee551573f2409822754ae940731909ec4b79cf836487e898df476adb10467506',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/multisigSigner',
    };
};

export const nemSignTransactionMultisigTests = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        aggregateModification: aggregateModificationSubtest,
        multisig: multisigSubtest,
        multisigSigner: multisigSignerSubtest,
    };

    describe('NEMSignTransactionMultisig', () => {
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