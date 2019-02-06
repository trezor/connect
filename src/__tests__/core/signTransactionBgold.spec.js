/* @flow */
import type {
    TestFunction,
    SubtestSignTransaction,
} from 'flowtype/tests';
import type {
    TestSignTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

const change = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bgold',
            inputs: [
                {
                    address_n: [44 | 0x80000000, 156 | 0x80000000, 0 | 0x80000000, 0, 0],
                    amount: '1995344',
                    prev_hash: '25526bf06c76ad3082bba930cf627cdd5f1b3cd0b9907dd7ff1a07e14addc985',
                    prev_index: 0,
                    script_type: 'SPENDADDRESS',
                },
            ],
            outputs: [
                {
                    address_n: [44 | 0x80000000, 156 | 0x80000000, 0 | 0x80000000, 1, 0],
                    amount: '1896050',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address: 'GfDB1tvjfm3bukeoBTtfNqrJVFohS2kCTe',
                    amount: '73452',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                signatures: [
                    '3045022100f03d3fe33c6a1306ca338da457c4f9e38c9c5e15ae0e079992604953f670cb78022026110ee7bbc528268ad885fa734f2fae75985cfec712c185c12ae74d315b1bd3',
                ],
                serializedTx: '010000000185c9dd4ae1071affd77d90b9d03c1b5fdd7c62cf30a9bb8230ad766cf06b5225000000006b483045022100f03d3fe33c6a1306ca338da457c4f9e38c9c5e15ae0e079992604953f670cb78022026110ee7bbc528268ad885fa734f2fae75985cfec712c185c12ae74d315b1bd34121021659b2309dcfb7ff4b88e2dc1a18471fca2aa3da64d1c85515fabcc82904d476ffffffff0272ee1c00000000001976a9143f0cf98e116e3a4049c7e78f05f1e935802df01088acec1e0100000000001976a914ea5f904d195079a350b534db4446433b3cec222e88ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/change',
    };
};

const noChange = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bgold',
            inputs: [
                {
                    address_n: [44 | 0x80000000, 156 | 0x80000000, 0 | 0x80000000, 1, 0],
                    amount: '1896050',
                    prev_hash: '25526bf06c76ad3082bba930cf627cdd5f1b3cd0b9907dd7ff1a07e14addc985',
                    prev_index: 0,
                    script_type: 'SPENDADDRESS',
                },
                {
                    address_n: [44 | 0x80000000, 156 | 0x80000000, 0 | 0x80000000, 1, 1],
                    amount: '73452',
                    prev_hash: 'db77c2461b840e6edbe7f9280043184a98e020d9795c1b65cb7cef2551a8fb18',
                    prev_index: 1,
                    script_type: 'SPENDADDRESS',
                },
            ],

            outputs: [
                {
                    address: 'GfDB1tvjfm3bukeoBTtfNqrJVFohS2kCTe',
                    amount: '1934960',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                signatures: [
                    '30430220533f82aef549abc1171716c4b152478f2a10c6eeb7f716594bad4a69f5d4aabe021f7a499d3f66ffb90ba001c2ed3bf3ddda7d8d380be8fe303fc59e7987db111e',
                    '30450221008c1b653f4b22df62148a6381a06e8c7010732555db1d7ef72f6c51892f83d32502201f3347c0c4a0c77857886066d56ef4f1942bb35a5ce3bf65ab7c6f4f7e205c8b',
                ],
                serializedTx: '010000000285c9dd4ae1071affd77d90b9d03c1b5fdd7c62cf30a9bb8230ad766cf06b522500000000694630430220533f82aef549abc1171716c4b152478f2a10c6eeb7f716594bad4a69f5d4aabe021f7a499d3f66ffb90ba001c2ed3bf3ddda7d8d380be8fe303fc59e7987db111e412102cf2b28fa22872ab35cb6e0728b51fb4c5d18e99284d030bc64b890859c645d5dffffffff18fba85125ef7ccb651b5c79d920e0984a18430028f9e7db6e0e841b46c277db010000006b4830450221008c1b653f4b22df62148a6381a06e8c7010732555db1d7ef72f6c51892f83d32502201f3347c0c4a0c77857886066d56ef4f1942bb35a5ce3bf65ab7c6f4f7e205c8b4121025a639d0293154eecd7afc45dce239f2bc387c3c45b3844ee98eda272fd32d7aeffffffff0170861d00000000001976a914ea5f904d195079a350b534db4446433b3cec222e88ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/noChange',
    };
};

const p2sh = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bgold',
            inputs: [
                {
                    address_n: [49 | 0x80000000, 156 | 0x80000000, 0 | 0x80000000, 1, 0],
                    amount: '123456789',
                    prev_hash: '25526bf06c76ad3082bba930cf627cdd5f1b3cd0b9907dd7ff1a07e14addc985',
                    prev_index: 0,
                    script_type: 'SPENDP2SHWITNESS',
                },
            ],

            outputs: [
                {
                    address: 'GfDB1tvjfm3bukeoBTtfNqrJVFohS2kCTe',
                    amount: '12300000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address: 'GZFLExxrvWFuFT1xRzhfwQWSE2bPDedBfn',
                    amount: '111145789',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                signatures: [
                    '3045022100e0c5c9db3fe1abbd7f2a4da946b357c362ce29a77e9588b6c3be36f39bd7953f02200d4a6ec682b4241a579cbea7b299dcbe3ff5157f16caadca0e252c24de51ce3f',
                ],
                serializedTx: '0100000000010185c9dd4ae1071affd77d90b9d03c1b5fdd7c62cf30a9bb8230ad766cf06b52250000000017160014bcf764faafca9982aba3612eb91370d091cddb4affffffff02e0aebb00000000001976a914ea5f904d195079a350b534db4446433b3cec222e88ac3df39f06000000001976a914a8f757819ec6779409f45788f7b4a0e8f51ec50488ac02483045022100e0c5c9db3fe1abbd7f2a4da946b357c362ce29a77e9588b6c3be36f39bd7953f02200d4a6ec682b4241a579cbea7b299dcbe3ff5157f16caadca0e252c24de51ce3f412103e4c2e99d4d9a36f949e947d94391d01bd016826afd87132b3257a660139b3b8a00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/p2sh',
    };
};

const p2shWitnessChange = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bgold',
            inputs: [
                {
                    address_n: [49 | 0x80000000, 156 | 0x80000000, 0 | 0x80000000, 1, 0],
                    amount: '123456789',
                    prev_hash: '25526bf06c76ad3082bba930cf627cdd5f1b3cd0b9907dd7ff1a07e14addc985',
                    prev_index: 0,
                    script_type: 'SPENDP2SHWITNESS',
                },
            ],

            outputs: [
                {
                    address: 'GfDB1tvjfm3bukeoBTtfNqrJVFohS2kCTe',
                    amount: '12300000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: [49 | 0x80000000, 156 | 0x80000000, 0 | 0x80000000, 1, 0],
                    amount: '111145789',
                    script_type: 'PAYTOP2SHWITNESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                signatures: [
                    '3045022100f15fd0b3a3b661f08d6cb932e54b0f23882a05c173cf5174f25af5a7ce77d069022037127e7ef34bf845bcff441d020dead71eabe478f16faa3705ee256fb3a26452',
                ],
                serializedTx: '0100000000010185c9dd4ae1071affd77d90b9d03c1b5fdd7c62cf30a9bb8230ad766cf06b52250000000017160014bcf764faafca9982aba3612eb91370d091cddb4affffffff02e0aebb00000000001976a914ea5f904d195079a350b534db4446433b3cec222e88ac3df39f060000000017a914fea1579ecdf0e50674819c9924fcc0007e7ec12b8702483045022100f15fd0b3a3b661f08d6cb932e54b0f23882a05c173cf5174f25af5a7ce77d069022037127e7ef34bf845bcff441d020dead71eabe478f16faa3705ee256fb3a26452412103e4c2e99d4d9a36f949e947d94391d01bd016826afd87132b3257a660139b3b8a00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/p2shWitnessChange',
    };
};

const sendMultisig1 = (): SubtestSignTransaction => {
    const address_n = [999 | 0x80000000, 1 | 0x80000000, 1 | 0x80000000, 2, 0];
    address_n[2] = 0x80000003;

    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bgold',
            inputs: [
                {
                    address_n: [999 | 0x80000000, 1 | 0x80000000, 0x80000003, 2, 0],
                    prev_hash: '25526bf06c76ad3082bba930cf627cdd5f1b3cd0b9907dd7ff1a07e14addc985',
                    prev_index: 1,
                    script_type: 'SPENDP2SHWITNESS',
                    amount: '1610436',
                    multisig: {
                        pubkeys: [
                            {
                                node: 'xpub6BwkFjrnaZMrHwR2webEmLSVm4dhvynoQ1TM2ta6WznmbJLXKzgLDeP3sa8TB79vAqJdrF5vPiGUbEf18jEUMdHAmhpyzR6qdxRnfvr61GW',
                                address_n: [2, 0],
                            },
                            {
                                node: 'xpub6BwkFjrnaZMrKVco3D1uXpqNMAa7rR1WiS2tTWhptB6K2RF2fHV6y15nAu4taL9KRuXW4nWBt8jj76orKtALDSPY8gLbHUBy3kH42aRXRmM',
                                address_n: [2, 0],
                            },
                            {
                                node: 'xpub6BwkFjrnaZMrQ5xEvXbBx14sn1NT24CuuA84T3fcroHfXxRxseQwHoYb6xij2uchX2PSjjeJfq53VGuPZphvN5DMo3MGk2SL4EWDuuQ5bit',
                                address_n: [2, 0],
                            },
                        ],
                        signatures: ['3045022100dad69cca1a408de702169c007f39c1f3f884716e07b9110e494f9e1adbd2a77b02202dc56ccc595a8b69e4a25bdd95e395c6307b36ca555d451a4059bdf0ec535a18', '', ''],
                        m: 2,
                    },
                },
            ],
            outputs: [
                {
                    address: 'GfDB1tvjfm3bukeoBTtfNqrJVFohS2kCTe',
                    amount: '1605000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];
    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                signatures: [
                    '3045022100a478e5358215d0896e41f3259e76d53d82123b43397d2fcba4646918ed10a38602201f2f67ac239b44fa6ddf724b445d49300d91d65733554e79206b2ec180d5ce3d',
                ],
                serializedTx: '0100000000010185c9dd4ae1071affd77d90b9d03c1b5fdd7c62cf30a9bb8230ad766cf06b52250100000023220020949ea1343a263ca9db30033322917725e37a955e17df902ca68e3fe5210190dfffffffff01887d1800000000001976a914ea5f904d195079a350b534db4446433b3cec222e88ac0400483045022100dad69cca1a408de702169c007f39c1f3f884716e07b9110e494f9e1adbd2a77b02202dc56ccc595a8b69e4a25bdd95e395c6307b36ca555d451a4059bdf0ec535a1841483045022100a478e5358215d0896e41f3259e76d53d82123b43397d2fcba4646918ed10a38602201f2f67ac239b44fa6ddf724b445d49300d91d65733554e79206b2ec180d5ce3d4169522102b9f95f18f40f57d0044fc1414dd4b344a28289b6848744dd797c8b1e8eb972c42102a98fed2ba9d0d360bc2d61910ce3b3bad000e488a501a21d3dc9bde84b969ad22103e38bac0a0c76efd6017f729715d5e8f5751d3d5f5fdb3d10d47cfb544143f02b53ae00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sendMultisig1',
    };
};

export const signTransactionBgold = (): TestFunction => {
    const availableSubtests = {
        change,
        noChange,
        p2sh,
        p2shWitnessChange,
        sendMultisig1,
    };
    const testName = 'SignTransactionBgold';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
