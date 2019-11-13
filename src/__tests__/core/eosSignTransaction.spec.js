/* todo: flow */
/* eslint-disable */
/* @flow */
import type {
    TestFunction,
    SubtestEosSignTransaction,
} from 'flowtype/tests';
import type {
    TestEosSignTransactionPayload,
    ExpectedEosSignTransactionResponse,
} from 'flowtype/tests/eos-sign-transaction';

// test vectors:
// https://github.com/trezor/trezor-firmware/blob/master/python/trezorlib/tests/device_tests/test_msg_eos_signtx.py

const transfer = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio.token',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'transfer',
                    data: {
                        from: 'miniminimini',
                        to: 'maximaximaxi',
                        quantity: '1.0000 EOS',
                        memo: 'testtest',
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_JveDuew7oyKjgLmApra3NmKArx3QH6HVmatgkLYeUYWv7aGaoQPFyjBwAdcxuo2Skq9wRgsizos92h9iq9i5JbeHh7zNuo",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/transfer',
    };
};

const delegate = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'delegatebw',
                    data: {
                        from: 'miniminimini',
                        receiver: 'maximaximaxi',
                        stake_net_quantity: '1.0000 EOS',
                        stake_cpu_quantity: '1.0000 EOS',
                        transfer: true,
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_Juju8Wjzyn38nuvgS1KT3koKQLHxMMfqVHrp5jMjv4QLU2pUG6EbiJD7D1EHE6xP8DRuwFLVUNR38nTyUKC1Eiz33WocUE",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/delegatebw',
    };
};

const undelegate = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'undelegatebw',
                    data: {
                        from: 'miniminimini',
                        receiver: 'maximaximaxi',
                        unstake_net_quantity: '1.0000 EOS',
                        unstake_cpu_quantity: '1.0000 EOS',
                        transfer: true,
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_K3XXUzCUkT2HEdrJTz1CdDDKZbLMShmyEjknQozGhy4F21yUetr1nEe2vUgmGebk2nyYe49R5nkA155J5yFBBaLsTcSdBL",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/undelegatebw',
    };
};

const buyRam = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'buyram',
                    data: {
                        payer: "miniminimini",
                        receiver: "miniminimini",
                        quant: '1000000000.0000 EOS',
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_K4gU5S9g7rS6MojaPwWppEBCBbPrJm1pyJtVR9mts1sBq5xyN7nJv3FGnrBR7ByjanboCtK4ogY35sNPFX1F5qoZW7BkF9",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/buyram',
    };
};

const buyRamBytes = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'buyrambytes',
                    data: {
                        payer: "miniminimini",
                        receiver: "miniminimini",
                        bytes: 1023,
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_K618wK9f27YxHoPG9hoUCsazZXzxumBj3V9MqcTUh9yCocvP1uFZQAmGmZLhsAtuC2TRR4gtqbeQj57FniYd5i4faQCb6t",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/buyrambytes',
    };
};

const sellRam = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'sellram',
                    data: {
                        account: "miniminimini",
                        bytes: 1024,
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_JusrCS7H5DR53qke7edoWvJuLiQS2VQ84CsN5NWmWYVa7wmJVjh3Hcg5hH42zF8KjAmmvHtaJZ3wkortTW9eds1eoiKsrj",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sellram',
    };
};

const voteProducer = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'voteproducer',
                    data: {
                        voter: "miniminimini",
                        proxy: '',
                        producers: [
                            "argentinaeos",
                            "bitfinexeos1",
                            "cryptolions1",
                            "eos42freedom",
                            "eosamsterdam",
                            "eosasia11111",
                            "eosauthority",
                            "eosbeijingbp",
                            "eosbixinboot",
                            "eoscafeblock",
                            "eoscanadacom",
                            "eoscannonchn",
                            "eoscleanerbp",
                            "eosdacserver",
                            "eosfishrocks",
                            "eosflytomars",
                            "eoshuobipool",
                            "eosisgravity",
                            "eoslaomaocom",
                            "eosliquideos",
                            "eosnewyorkio",
                            "eosriobrazil",
                            "eosswedenorg",
                            "eostribeprod",
                            "helloeoscnbp",
                            "jedaaaaaaaaa",
                            "libertyblock",
                            "starteosiobp",
                            "teamgreymass",
                        ],
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_JxgVhc6ExoTHee3Djrciwmmf2Xck7NLgvAtC2gfgV4Wj2AqMXEb6aKMhpUcTV59VTR1DdnPF1XbiCcJViJiU3zsk1kQz89",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/voteproducer',
    };
};

const refund = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'refund',
                    data: {
                        owner: "miniminimini",
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_JwWZSSKQZL1hCdMmwEAKjs3r15kau5gaBrQczKy65QANANzovV6U4XbVUZQkZzaQrNGYAtgxrU1WJ1smWgXZNqtKVQUZqc",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/refund',
    };
};

const updateAuth = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'updateauth',
                    data: {
                        account: 'miniminimini',
                        permission: 'active',
                        parent: 'owner',
                        auth: {
                            threshold: 1,
                            keys: [
                                {
                                    weight: 1,
                                    key: 'EOS8Dkj827FpinZBGmhTM28B85H9eXiFH5XzvLoeukCJV5sKfLc6K',
                                },
                                {
                                    weight: 2,
                                    key: 'EOS8Dkj827FpinZBGmhTM28B85H9eXiFH5XzvLoeukCJV5sKfLc6K',
                                }
                            ],
                            accounts: [{
                                permission: {
                                    actor: 'miniminimini',
                                    permission: 'active',
                                },
                                weight: 3,
                            }],
                            waits: [
                                {
                                    wait_sec: 55,
                                    weight: 4
                                }
                            ]
                        },
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_JuNuwmJm7nLfpxbCqXZMxZoU56TzBh8F5PH7ZyPvQMti6QxJbErDGbKCAaHhoRxwWKzv5kj6kX3WyWys6jAzVe9pDhXB1k",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/updateAuth',
    };
};

const deleteAuth = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'deleteauth',
                    data: {
                        account: 'maximaximaxi',
                        permission: 'active',
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_KjPTp8jCtgBKQWqsndhrH4pdCGiks76Q1qBt9e8MtexW6FQg3FzfVFKDU4SvyVDyFs3worn6RyW6WYavw76ACNqcqkCYjf",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/deleteAuth',
    };
};

const linkAuth = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'linkauth',
                    data: {
                        account: 'maximaximaxi',
                        code: 'eosbet',
                        type: 'whatever',
                        requirement: 'active',
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: "SIG_K1_Kgs3JdLNqTyGz7uyNiuYLK8sy5qhVQWozrBY7bJWKsjrWAxNyDQUKqHsHmTom5rGY21vYdXmCpi4msU6XeMgWvi4bsBxTx",
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/linkAuth',
    };
};

const unlinkAuth = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    account: 'eosio',
                    authorization: [{
                        actor: 'miniminimini',
                        permission: 'active',
                    }],
                    name: 'unlinkauth',
                    data: {
                        account: 'miniminimini',
                        code: 'eosbet',
                        type: 'whatever',
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: 'SIG_K1_K1ioB5KMRC2mmTwYsGwsFU51ENp1XdSBUrb4bxUCLYhoq7Y733WaLZ4Soq9fdrkaJS8uJ3R7Z1ZjyEKRHU8HU4s4MA86zB',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/unlinkAuth',
    };
};

const newAccount = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [
                    {
                        account: 'eosio',
                        authorization: [{
                            actor: 'miniminimini',
                            permission: 'active',
                        }],
                        name: 'newaccount',
                        data: {
                            creator: 'miniminimini',
                            name: 'maximaximaxi',
                            owner: {
                                threshold: 1,
                                keys: [
                                    {
                                        key: 'EOS8Dkj827FpinZBGmhTM28B85H9eXiFH5XzvLoeukCJV5sKfLc6K',
                                        weight: 1,
                                    }
                                ],
                                accounts: [],
                                waits: [],
                            },
                            active: {
                                threshold: 1,
                                keys: [
                                    {
                                        key: 'EOS8Dkj827FpinZBGmhTM28B85H9eXiFH5XzvLoeukCJV5sKfLc6K',
                                        weight: 1,
                                    }
                                ],
                                accounts: [],
                                waits: [],
                            },
                        },
                    },
                    {
                        account: 'eosio',
                        name: 'buyrambytes',
                        authorization: [
                            {actor: 'miniminimini', permission: 'active'}
                        ],
                        data: {
                            payer: 'miniminimini',
                            receiver: 'maximaximaxi',
                            bytes: 4096,
                        },
                    },
                    {
                        account: "eosio",
                        name: "delegatebw",
                        authorization: [
                            {actor: "miniminimini", permission: "active"}
                        ],
                        data: {
                            from: 'miniminimini',
                            receiver: 'maximaximaxi',
                            stake_net_quantity: '1.0000 EOS',
                            stake_cpu_quantity: '1.0000 EOS',
                            transfer: true,
                        },
                    }
                ]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: 'SIG_K1_KhjdS1gKUHR4jKbN3YSdNbPbEqnUVM1Nt6ybdzEAwsUtfbCRJDwpQwPRuEau48CyvhYC5fKo5BiWMPQJbQPrg5ErHThieU',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/newAccount',
    };
};

const setContract = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-06-19T13:29:53',
                    refBlockNum: 30587,
                    refBlockPrefix: 338239089,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [
                    {
                        account: "eosio1",
                        name: "setcode",
                        authorization: [
                            {"actor": "ednazztokens", "permission": "active"}
                        ],
                        data: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                    },
                    {
                        account: "eosio1",
                        name: "setabi",
                        authorization: [
                            {"actor": "ednazztokens", "permission": "active"}
                        ],
                        data: '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
                    },
                ]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: 'SIG_K1_KiG8c8t2SQkSfrEbD9BwJoYT133BPFLx3gu8sAzJadXyFk1EXKYAsgx4tkjt79G6ofuaQzJPAfDqy1FSpgLRbhbeFH9omd',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/setContract',
    };
};

const unknown = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f',
                header: {
                    expiration: '2018-07-14T10:43:28',
                    refBlockNum: 6439,
                    refBlockPrefix: 2995713264,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [
                    {
                        "account": "foocontract",
                        "name": "baraction",
                        "authorization": [
                            {"actor": "miniminimini", "permission": "active"}
                        ],
                        "data": "deadbeef",
                    },
                ]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signature: 'SIG_K1_JvoJtrHpQJjHAZzEBhiQm75iimYabcAVNDvz8mkempLh6avSJgnXm5JzCCUEBjDtW3syByfXknmgr93Sw3P9RNLnwySmv6',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/unknown',
    };
};

export const eosSignTransaction = (): TestFunction => {
    const testName = 'EosSignTransaction';

    return {
        testName,
        subtests: {
            transfer,
            delegate,
            undelegate,
            buyRam,
            buyRamBytes,
            sellRam,
            voteProducer,
            refund,
            updateAuth,
            deleteAuth,
            linkAuth,
            unlinkAuth,
            newAccount,
            setContract,
            unknown,
        },
        mnemonic: 'mnemonic_12',
    };
};