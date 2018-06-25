import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { getHDPath } from '../../js/utils/pathUtils.js';

const sendP2shSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: getHDPath("49'/1'/0'/1/0"),
                    amount: 123456789,
                    prev_hash: '20912f98ea3ed849042efed0fdac8cb4fc301961c5988cba56902d8ffb61c337',
                    prev_index: 0,
                    script_type: 'SPENDP2SHWITNESS',
                },
            ],
            outputs: [
                {
                    address: 'mhRx1CeVfaayqRwq5zgRQmD7W5aWBfD5mC',
                    amount: 12300000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address: '2N1LGaGg836mqSQqiuUBLfcyGBhyZbremDX',
                    amount: 123456789 - 11000 - 12300000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '0100000000010137c361fb8f2d9056ba8c98c5611930fcb48cacfdd0fe2e0449d83eea982f91200000000017160014d16b8c0680c61fc6ed2e407455715055e41052f5ffffffff02e0aebb00000000001976a91414fdede0ddc3be652a0ce1afbc1b509a55b6b94888ac3df39f060000000017a91458b53ea7f832e8f096e896b8713a8c6df0e892ca8702483045022100ccd253bfdf8a5593cd7b6701370c531199f0f05a418cd547dfc7da3f21515f0f02203fa08a0753688871c220648f9edadbdb98af42e5d8269364a326572cf703895b012103e7bfe10708f715e8538c92d46ca50db6f657bbc455b7494e6a0303ccdb868b7900000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sendP2sh',
    };
};

const sendP2shChangeSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: getHDPath("49'/1'/0'/1/0"),
                    amount: 123456789,
                    prev_hash: '20912f98ea3ed849042efed0fdac8cb4fc301961c5988cba56902d8ffb61c337',
                    prev_index: 0,
                    script_type: 'SPENDP2SHWITNESS',
                },
            ],
            outputs: [
                {
                    address: 'mhRx1CeVfaayqRwq5zgRQmD7W5aWBfD5mC',
                    amount: 12300000,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: getHDPath("49'/1'/0'/1/0"),
                    amount: 123456789 - 11000 - 12300000,
                    script_type: 'PAYTOP2SHWITNESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '0100000000010137c361fb8f2d9056ba8c98c5611930fcb48cacfdd0fe2e0449d83eea982f91200000000017160014d16b8c0680c61fc6ed2e407455715055e41052f5ffffffff02e0aebb00000000001976a91414fdede0ddc3be652a0ce1afbc1b509a55b6b94888ac3df39f060000000017a91458b53ea7f832e8f096e896b8713a8c6df0e892ca8702483045022100ccd253bfdf8a5593cd7b6701370c531199f0f05a418cd547dfc7da3f21515f0f02203fa08a0753688871c220648f9edadbdb98af42e5d8269364a326572cf703895b012103e7bfe10708f715e8538c92d46ca50db6f657bbc455b7494e6a0303ccdb868b7900000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sendP2shChange',
    };
};

const sendMultisig1Subtest = (): void => {
    const testPayloads = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: getHDPath("999'/1'/1'/2/0"),
                    amount: 1610436,
                    prev_hash: '9c31922be756c06d02167656465c8dc83bb553bf386a3f478ae65b5c021002be',
                    prev_index: 1,
                    script_type: 'SPENDP2SHWITNESS',
                    multisig: {
                        pubkeys: [
                            {
                                node: "999'/1'/1'",
                                address_n: [2, 0],
                            },
                            {
                                node: "999'/1'/2'",
                                address_n: [2, 0],
                            },
                            {
                                node: "999'/1'/3'",
                                address_n: [2, 0],
                            },
                        ],
                        signatures: ['', '', ''],
                        m: 2,
                    },
                },
            ],
            outputs: [
                {
                    address: 'mhRx1CeVfaayqRwq5zgRQmD7W5aWBfD5mC',
                    amount: 1605000,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000000101be0210025c5be68a473f6a38bf53b53bc88d5c46567616026dc056e72b92319c01000000232200201e8dda334f11171190b3da72e526d441491464769679a319a2f011da5ad312a1ffffffff01887d1800000000001976a91414fdede0ddc3be652a0ce1afbc1b509a55b6b94888ac040047304402205b44c20cf2681690edaaf7cd2e30d4704124dd8b7eb1fb7f459d3906c3c374a602205ca359b6544ce2c101c979899c782f7d141c3b0454ea69202b1fb4c09d3b715701473044022052fafa64022554ae436dbf781e550bf0d326fef31eea1438350b3ff1940a180102202851bd19203b7fe8582a9ef52e82aa9f61cd52d4bcedfe6dcc0cf782468e6a8e01695221038e81669c085a5846e68e03875113ddb339ecbb7cb11376d4163bca5dc2e2a0c1210348c5c3be9f0e6cf1954ded1c0475beccc4d26aaa9d0cce2dd902538ff1018a112103931140ebe0fbbb7df0be04ed032a54e9589e30339ba7bbb8b0b71b15df1294da53ae00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sendMultisig1',
    };
};

export const signTxSegwitTests = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        sendP2sh: sendP2shSubtest,
        sendP2shChange: sendP2shChangeSubtest,
        sendMultisig1: sendMultisig1Subtest,
    };

    describe('SignTxSegwit', () => {
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
