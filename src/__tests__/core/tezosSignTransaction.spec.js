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
            branch: "f2ae0c72fdd41d7a89bebfe8d6dd6d38e0fcd0782adb8194717176eb70366f64",
            operation: {
                transaction: {
                    source: {
                        tag: 0,
                        hash: "00001e65c88ae6317cd62a638c8abd1e71c83c8475",
                    },
                    fee: 0,
                    counter: 108925,
                    gas_limit: 200,
                    storage_limit: 0,
                    amount: 10000,
                    destination: {
                        tag: 0,
                        hash: "0004115bce5af2f977acbb900f449c14c53e1d89cf",
                    },
                },
            },
        },
    ];
    const expectedResponses: Array<ExpectedTezosSignTransactionResponse> = [
        {
            payload: {
                signature: 'edsigtvp8oeWvmQGvukGiRSE535UFjbQmLyq3C3GBmWgNsMd2yizhknBLic6rn9j8teN4c5oHUncbxgXnGshRFZWMDJdcq43uTh',
                sig_op_contents: 'f2ae0c72fdd41d7a89bebfe8d6dd6d38e0fcd0782adb8194717176eb70366f64080000001e65c88ae6317cd62a638c8abd1e71c83c847500fdd206c80100904e000004115bce5af2f977acbb900f449c14c53e1d89cf00afda12d2445bef9a2d1f3c953f2baff0a1e7487880288b760b7b4e6917a122397d6b78c7e7d8ec196980326f484d7b995bfae3494bcfe6cb3b705f62d903280c',
                operation_hash: 'op5EWdUTq3Fnw4A8LG8nbjhhQcLMjQMVQtTCLJJYcUawjqwWxRV'
            }
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/transaction',
    };
};


export const tezosSignTransaction = (): TestFunction => {
    const availableSubtests = {
        transaction,
        // origination,
        // delegation,
    };

    const testName = 'TezosSignTransaction';

    return {
        testName,
        subtests: {
            ...availableSubtests,
        },
    };
};
