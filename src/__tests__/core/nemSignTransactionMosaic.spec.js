import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { TX_TYPES } from '../../js/core/methods/helpers/nemSignTx.js';
import { settings, CoreEventHandler } from './common.js';

const supplyChangeSubtest = (): void => {
    const testPayloads = [
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 74649215,
                fee: 2000000,
                type: TX_TYPES.supplyChange,
                deadline: 74735615,
                message: {},
                mosaicId: {
                    namespaceId: 'hellom',
                    name: 'Hello mosaic',
                },
                supplyType: 1,
                delta: 1,
                version: -1744830464,
                creationFeeSink: '0xTALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                creationFee: 1500,
            },
        },
    ];
    const expectedResponses = [
        {
            payload: {
                data: '02400000010000987f0e730420000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b406208480841e0000000000ff5f74041a0000000600000068656c6c6f6d0c00000048656c6c6f206d6f73616963010000000100000000000000',
                signature: '928b03c4a69fff35ecf0912066ea705895b3028fad141197d7ea2b56f1eef2a2516455e6f35d318f6fa39e2bb40492ac4ae603260790f7ebc7ea69feb4ca4c0a',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/supplyChange',
    };
};

const creationSubtest = (): void => {
    const testPayloads = [
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 74649215,
                fee: 2000000,
                type: TX_TYPES.creation,
                deadline: 74735615,
                message: { },
                mosaicDefinition: {
                    id: {
                        namespaceId: 'hellom',
                        name: 'Hello mosaic',
                    },
                    levy: { },
                    properties: { } ,
                    description: 'lorem',
                },
                version: -1744830464, // testnet
                creationFeeSink: '0xTALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                creationFee: 1500,
            },
        },
    ];
    const expectedResponses = [
        {
            payload: {
                data: '01400000010000987f0e730420000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b406208480841e0000000000ff5f7404c100000020000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b40620841a0000000600000068656c6c6f6d0c00000048656c6c6f206d6f73616963050000006c6f72656d04000000150000000c00000064697669736962696c6974790100000030160000000d000000696e697469616c537570706c7901000000301a0000000d000000737570706c794d757461626c650500000066616c7365190000000c0000007472616e7366657261626c650500000066616c7365000000002800000054414c49434532474d4133344358484437584c4a513533364e4d35554e4b5148544f524e4e54324adc05000000000000',
                signature: '537adf4fd9bd5b46e204b2db0a435257a951ed26008305e0aa9e1201dafa4c306d7601a8dbacabf36b5137724386124958d53202015ab31fb3d0849dfed2df0e',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/creation',
    };
};

const creationPropertiesSubtest = (): void => {
    const testPayloads = [
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 74649215,
                fee: 2000000,
                type: TX_TYPES.creation,
                deadline: 74735615,
                message: {},
                mosaicDefinition: {
                    id: {
                        namespaceId: 'hellom',
                        name: 'Hello mosaic',
                    },
                    levy: {} ,
                    properties: [
                        {
                            name: 'divisibility',
                            value: '4'
                        },
                        {
                            name: 'initialSupply',
                            value: '200'
                        },
                        {
                            name: 'supplyMutable',
                            value: 'false'
                        },
                        {
                            name: 'transferable',
                            value: 'true'
                        },
                    ],
                    description: 'lorem',
                },
                version: -1744830464,
                creationFeeSink: '0xTALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                creationFee: 1500,
            },
        },
    ];
    const expectedResponses = [
        {
            payload: {
                data: '01400000010000987f0e730420000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b406208480841e0000000000ff5f7404c100000020000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b40620841a0000000600000068656c6c6f6d0c00000048656c6c6f206d6f73616963050000006c6f72656d04000000150000000c00000064697669736962696c6974790100000030160000000d000000696e697469616c537570706c7901000000301a0000000d000000737570706c794d757461626c650500000066616c7365190000000c0000007472616e7366657261626c650500000066616c7365000000002800000054414c49434532474d4133344358484437584c4a513533364e4d35554e4b5148544f524e4e54324adc05000000000000',
                signature: '537adf4fd9bd5b46e204b2db0a435257a951ed26008305e0aa9e1201dafa4c306d7601a8dbacabf36b5137724386124958d53202015ab31fb3d0849dfed2df0e',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/creationProperties',
    };
};

const creationLevySubtest = (): void => {
    const testPayloads = [
        {
            method: 'nemSignTransaction',
            path: "m/44'/1'/0'/0'/0'",
            transaction: {
                timeStamp: 74649215,
                fee: 2000000,
                type: TX_TYPES.creation,
                deadline: 74735615,
                message: {},
                mosaicDefinition: {
                    id: {
                        namespaceId: 'hellom',
                        name: 'Hello mosaic',
                    },
                    levy: {
                        type: 1,
                        fee: 2,
                        recipient: 'TALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                        mosaicId: {
                            namespaceId: 'hellom',
                            name: 'Hello mosaic',
                        },
                    },
                    properties: [
                        {
                            name: 'divisibility',
                            value: '4'
                        },
                        {
                            name: 'initialSupply',
                            value: '200'
                        },
                        {
                            name: 'supplyMutable',
                            value: 'false'
                        },
                        {
                            name: 'transferable',
                            value: 'true'
                        },
                    ],
                    description: 'lorem',
                },
                version: -1744830464,
                creationFeeSink: '0xTALICE2GMA34CXHD7XLJQ536NM5UNKQHTORNNT2J',
                creationFee: 1500,
            },
        },
    ];
    const expectedResponses = [
        {
            payload: {
                data: '01400000010000987f0e730420000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b406208480841e0000000000ff5f74041801000020000000edfd32f6e760648c032f9acb4b30d514265f6a5b5f8a7154f2618922b40620841a0000000600000068656c6c6f6d0c00000048656c6c6f206d6f73616963050000006c6f72656d04000000150000000c00000064697669736962696c6974790100000034180000000d000000696e697469616c537570706c79030000003230301a0000000d000000737570706c794d757461626c650500000066616c7365180000000c0000007472616e7366657261626c65040000007472756556000000010000002800000054414c49434532474d4133344358484437584c4a513533364e4d35554e4b5148544f524e4e54324a1a0000000600000068656c6c6f6d0c00000048656c6c6f206d6f7361696302000000000000002800000054414c49434532474d4133344358484437584c4a513533364e4d35554e4b5148544f524e4e54324adc05000000000000',
                signature: 'b87aac1ddf146d35e6a7f3451f57e2fe504ac559031e010a51261257c37bd50fcfa7b2939dd7a3203b54c4807d458475182f5d3dc135ec0d1d4a9cd42159fd0a',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/creationLevy',
    };
};

export const nemSignTransactionMosaicTests = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        supplyChange: supplyChangeSubtest,
        creation: creationSubtest,
        creationProperties: creationPropertiesSubtest,
        creationLevy: creationLevySubtest,
    };

    describe('NEMSignTransactionMosaic', () => {
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
}
