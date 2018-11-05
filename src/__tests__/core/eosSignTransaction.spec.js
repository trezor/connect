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

const transfer = (): SubtestEosSignTransaction => {
    const testPayloads: Array<TestEosSignTransactionPayload> = [
        {
            method: 'eosSignTransaction',
            path: "m/44'/194'/0'/0/0",
            transaction: {
                chainId: [3,143,75,15,200,255,24,164,240,132,42,143,5,100,97,
                    31,110,150,232,83,89,1,221,69,228,58,200,105,26,28,77,202],
                header: {
                    expiration: 1541342912,
                    refBlockNum: 49892,
                    refBlockPrefix: 3352207307,
                    maxNetUsageWords: 0,
                    maxCpuUsageMs: 0,
                    delaySec: 0,
                },
                actions: [{
                    common: {
                        account: { low: 880977408, high: 1429268995, unsigned: true },
                        name: { low: 1459617792, high: -842187731, unsigned: true },
                        authorization: [{
                            actor: { low: 138547328, high: 831283993, unsigned: true },
                            permission: { low: 0, high: 842198440, unsigned: true },
                        }]
                    },
                    transfer: {
                        sender: { low: 138547328, high: 831283993, unsigned: true },
                        receiver: { low: 138547328, high: 831283993, unsigned: true },
                        quantity: {
                            amount: { low: 10000, high: 0, unsigned: false },
                            symbol: { low: 1397703940, high: 0, unsigned: true },
                        },
                        memo: 'memo',
                    },
                }]
            },
        },
    ];
    const expectedResponses: Array<ExpectedEosSignTransactionResponse> = [
        {
            payload: {
                signatureR: "75e4114781333a506a2878c3ce585f7f9e23b336dc25b1a1643a752e94812277",
                signatureS: "134cbcc081d7ea9f97110814a56bb020c875db7ecab7f53e01cd49297400b16b",
                signatureV: 32,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/transfer',
    };
};

export const eosSignTransaction = (): TestFunction => {
    const testName = 'EosSignTransaction';
    const availableSubtests = {
        transfer,
        // delegate,
        // undelegate,
        // buyRam,
        // buyRamBytes,
        // sellRam,
        // refund,
        // voteProducer,
        // updateAuth,
    };

    return {
        testName,
        subtests: {
            ...availableSubtests,
        },
    };
};