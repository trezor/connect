/* @flow */
import type {
    TestFunction,
    SubtestTezosSignTransaction,
} from 'flowtype/tests';

import type {
    TestTezosSignTransactionPayload,
    ExpectedTezosSignTransactionResponse,
} from 'flowtype/tests/tezos-sign-transaction';

const transaction = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/0'",
            branch: 'BKk7ZsvvkQSntQ31j2Hxsw8bfYtUKGjsKHT2aQrxAqUYyQUHxmM',
            operation: {
                transaction: {
                    source: 'tz1ckrgqGGGBt4jGDmwFhtXc1LNpZJUnA9F2',
                    destination: 'tz1cTfmc5uuBr2DmHDgkXTAoEcufvXLwq5TP',
                    counter: 20449,
                    amount: 1000000000,
                    fee: 10000,
                    gas_limit: 11000,
                    storage_limit: 277,
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtYYMqXoSRzLJ6fLLNVqdoLsmgMYviu4uayGL9HjRpppD7H8mpJPqNuQJYvoMoHj1R9ubHJicwoKxwFo7McGLZ9t7yJSUCH',
                sig_op_contents: '0428a9f5a494e6f659ec2c58e80402db1a672db1dde75e872aa70a75f2323662080000bbc4b2c78ab2319ca9685839e38c49315c89620a904ee19f01f85595028094ebdc030000b884836ba056eee88204e5d9d3827adc88fd057600059d1ff17b1a0216f0ac8903fcee6e7a9b0dd22ee095625261510abc1b1695db9170f3571375b37ad25737296e4e47830a06be6e45ddc560f1aae1274958670d',
                operation_hash: 'onno3PJaFFxD1KhpC6WKjeNjkEuSxsTjnXQMwKG3fMVNzRuWSHx',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/transaction',
    };
};

const origination = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/0'",
            branch: 'BLHRTdZ5vUKSDbkp5vcG1m6ZTST4SRiHWUhGodysLTbvACwi77d',
            operation: {
                origination: {
                    source: 'tz1ckrgqGGGBt4jGDmwFhtXc1LNpZJUnA9F2',
                    manager_pubkey: 'tz1ckrgqGGGBt4jGDmwFhtXc1LNpZJUnA9F2',
                    delegate: 'tz1boot1pK9h2BVGXdyvfQSv8kd1LQM6H889',
                    balance: 100000000,
                    fee: 10000,
                    counter: 20450,
                    gas_limit: 10100,
                    storage_limit: 277,
                    spendable: true,
                    delegatable: true,
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtthmP5jEAzkoFJjV4jUQ2bKaWumMxbB5w1SppF21DxDohM2bRiVsqPQT9vGBFzpBJ4wamnuHAh61WmngxPHNCGVSjjRUj2',
                sig_op_contents: '4b3fa3e26a700ca5c4eeddd9d666a8cf273a2c6844c77390ee143f8e5b48a21e090000bbc4b2c78ab2319ca9685839e38c49315c89620a904ee29f01f44e950200bbc4b2c78ab2319ca9685839e38c49315c89620a80c2d72fffffff00b15b7a2484464ed3228c0ae23d0391f8269de3da009fb9aacea516c71bb0ef8880db4d879c91102500aa75c547e1d6cc93fa7c8471f9e234334c3a9f9b920a14d1e17b1bcad0d8c5408c750c35bb0dbc61f774290a',
                operation_hash: 'op6ixTnNA3RLemqPckGYV6z2Q1FGDX9Mzh22DMgYAeETh31bCYG',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/origination',
    };
};

const delegation = (): SubtestTezosSignTransaction => {
    const testPayloads: Array<TestTezosSignTransactionPayload> = [
        {
            method: 'tezosSignTransaction',
            path: "m/44'/1729'/0'",
            branch: 'BMXAKyvzcH1sGQMqpvqXsZGskYU4GuY9Y14c9g3LcNzMRtfLzFa',
            operation: {
                reveal: {
                    source: 'KT1XYKxAFhtpTKWyoK2MrAQsMQ39KyV7NyA9',
                    public_key: 'edpkuxZ5W8c2jmcaGuCFZxRDSWxS7hp98zcwj2YpUZkJWs5F7UMuF6',
                    counter: 1,
                    fee: 10000,
                    gas_limit: 10100,
                    storage_limit: 277,
                },
                delegation: {
                    source: 'KT1XYKxAFhtpTKWyoK2MrAQsMQ39KyV7NyA9',
                    delegate: 'tz1boot3mLsohEn4pV9Te3hQihH6N8U3ks59',
                    counter: 2,
                    fee: 10000,
                    gas_limit: 10100,
                    storage_limit: 277,
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtc1gZCfidw3ojCj5txZwm18TgizF6MJnGq1YGsT3kFxKMwxNp9KjSSdu8Nri8ygSstvD8HLDoDdd4HRBogp8Q8nxZX6acC',
                sig_op_contents: 'ee2419384816e307289b8f0e9c4dddbb1ab26410630474b39d61a734aa5276420701fbd4ae01ab3b11e5fc9c1b5ea2d4a36705877a8800904e01f44e950200ad5110dbf8aed613f84d8aad9a4f20d2594c05c6d7de5f296e1ac5d8e0791f2c0a01fbd4ae01ab3b11e5fc9c1b5ea2d4a36705877a8800904e02f44e9502ff00b15b7a44356bb1a620bec695b751465cd33422fe20253353a4d252a06a327b6598492a306030e53037607f23fd8d4dfd54f15273f24390f75acc43b2361889a08f7dc7f9c223ffd66fc4e184308978cf0c52ef0e',
                operation_hash: 'oo2N7YRtMoHFZ2pM4WD29z4F1gzX8MFERwwJYGtWj6ufBxdo4N7',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/delegation',
    };
};

export const tezosSignTransaction = (): TestFunction => {
    const availableSubtests = {
        transaction,
        origination,
        delegation,
    };

    const testName = 'TezosSignTransaction';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
