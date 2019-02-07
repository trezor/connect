/* @flow */
import type {
    TestFunction,
    SubtestSignTransaction,
} from 'flowtype/tests';
import type {
    TestSignCPCTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

const signCPC = (): SubtestSignTransaction => {
    // See tx 1bf227e6e24fe1f8ac98849fe06a2c5b77762e906fcf7e82787675f7f3a10bb8
    const testPayloads: Array<TestSignCPCTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Capricoin',
            timestamp: 1540316262,
            inputs: [
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 0],
                    prev_hash: '3bf506c81ce84eda891679ddc797d162c17c60b15d6c0ac23be5e31369e7235f',
                    prev_index: 0,
                },
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 0],
                    prev_hash: 'f3a6e6411f1b2dffd76d2729bae8e056f8f9ecf8996d3f428e75a6f23f2c5e8c',
                    prev_index: 1,
                },
            ],
            outputs: [
                {
                    address: 'CUGi8RGPWxbHM6FxF4eMEfqmQ6Bs5VjCdr',
                    amount: '2980000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '01000000665ccf5b025f23e76913e3e53bc20a6c5db1607cc162d197c7dd791689da4ee81cc806f53b000000006b483045022100fce7ccbeb9524f36d118ebcfebcb133a05c236c4478e2051cfd5c9632920aee602206921b7be1a81f30cce3d8e7dba4597fc16a2761c42321c49d65eeacdfe3781250121021fcf98aee04939ec7df5762f426dc2d1db8026e3a73c3bbe44749dacfbb61230ffffffff8c5e2c3ff2a6758e423f6d99f8ecf9f856e0e8ba29276dd7ff2d1b1f41e6a6f3010000006a473044022015d967166fe9f89fbed8747328b1c4658aa1d7163e731c5fd5908feafe08e9a6022028af30801098418bd298cc60b143c52c48466f5791256721304b6eba4fdf0b3c0121021fcf98aee04939ec7df5762f426dc2d1db8026e3a73c3bbe44749dacfbb61230ffffffff01a0782d00000000001976a914818437acfd15780debd31f3fd21d4ca678bb36d188ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/signCPC',
    };
};

export const signTransactionCapricoin = (): TestFunction => {
    const availableSubtests = {
        signCPC,
    };
    return {
        testName: 'SignTransactionCapricoin',
        mnemonic: 'mnemonic_all',
        subtests: {
            ...availableSubtests,
        },
    };
};
