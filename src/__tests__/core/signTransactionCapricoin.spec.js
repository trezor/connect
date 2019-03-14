/* @flow */
import type {
    TestFunction,
    SubtestSignTransaction,
} from 'flowtype/tests';
import type {
    TestSignTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

const signCPC = (): SubtestSignTransaction => {
    // See tx 1bf227e6e24fe1f8ac98849fe06a2c5b77762e906fcf7e82787675f7f3a10bb8
    const testPayloads: Array<TestSignTransactionPayload> = [
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

const oneTwoFee = (): SubtestSignTransaction => {
    // See tx 8302cb4b32815ac47e0d1a63081a7bbef843efeb7e29c414975f33dfe8b50e35
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Capricoin',
            timestamp: 1540206900,
            inputs: [
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 0],
                    prev_hash: '915340ecc7466d287596f1f5b1fa0c1fa78c5b76ede0dff978fd6a1ca31eee24',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: 'CZ49j4UcZJffuHwxrbb31zs7qHVAD5ugKv',
                    amount: '479000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 4],
                    amount: '1000000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '0100000034b1cd5b0124ee1ea31c6afd78f9dfe0ed765b8ca71f0cfab1f5f19675286d46c7ec405391000000006b483045022100d1ea4b08fa18b6c672d859939b4729f6c7aedb86ccf6dec8fd951cf49116415502206690a32ae8e0a02bbcae6102cedae0d14d2291f758eff786f85eb4642145a2f50121021fcf98aee04939ec7df5762f426dc2d1db8026e3a73c3bbe44749dacfbb61230ffffffff02184f0700000000001976a914b5fcce71b52fe2a05479610906e6aa81f4a6e76488ac40420f00000000001976a914544e87b53141b883b392d114168c5403899756c488ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oneTwoFee',
    };
};

const twoTwoFee = (): SubtestSignTransaction => {
    // See tx f65956f14d960fce26dc03948306516c606dd33b7612d063008fea390d48b12b
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Capricoin',
            timestamp: 1540222966,
            inputs: [
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 0],
                    prev_hash: '3d00cb457a7a0d8f491296340696271b9440a4b50e5429cf5e51fe128bce10d8',
                    prev_index: 0,
                },
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 1],
                    prev_hash: '8c4553a62d28a2aa605dc82e80c8e30fdadd49bf950d902c37c34428d5ff58a1',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 1],
                    amount: '910000',
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 2],
                    amount: '5000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '01000000f6efcd5b02d810ce8b12fe515ecf29540eb5a440941b279606349612498f0d7a7a45cb003d000000006a47304402202a69b2ec8eba6f3b71b3064571f712093d41aa9058e4ac241c0afea3d6da77b0022026c07274b4a65059082373e515fc2fe0631ff12c35fdbe6b7007d17f41fa155c0121021fcf98aee04939ec7df5762f426dc2d1db8026e3a73c3bbe44749dacfbb61230ffffffffa158ffd52844c3372c900d95bf49ddda0fe3c8802ec85d60aaa2282da653458c000000006a473044022010ef754dd83044a2e5ccca4b25193cd2662461a0a02c00b7d88b2a73c6d388c602205a8f8844fe1eb1f1f5b1c199165a1487879b82fb012c831809e2a822ec32ca070121034e9fef46313529347cddd19994817f446a3667a0652e57dc8cfe24a8c903f0f1ffffffff02b0e20d00000000001976a914818437acfd15780debd31f3fd21d4ca678bb36d188ac88130000000000001976a914fe251c9c3f10efafe8ede9b2a6d58c326622cc7388ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/twoTwoFee',
    };
};

const notEnoughFunds = (): SubtestSignTransaction => {
    // See tx 915340ecc7466d287596f1f5b1fa0c1fa78c5b76ede0dff978fd6a1ca31eee24
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Capricoin',
            timestamp: 1539868245,
            inputs: [
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 0],
                    prev_hash: '915340ecc7466d287596f1f5b1fa0c1fa78c5b76ede0dff978fd6a1ca31eee24',
                    prev_index: 1,
                },
            ],
            outputs: [
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 1],
                    amount: '51976101',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                code: 'Failure_NotEnoughFunds',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/notEnoughFunds',
    };
};

const feeTooHigh = (): SubtestSignTransaction => {
    // See tx 1570416eb4302cf52979afd5e6909e37d8fdd874301f7cc87e547e509cb1caa6
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Capricoin',
            timestamp: 1540210634,
            inputs: [
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 1],
                    prev_hash: 'f8a9bb54de8295de3cd681d89b69834812eb5222d04b3fec206eb273f69ffdbb',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address_n: [2147483692, 2147483937, 2147483648, 0, 0],
                    amount: '990000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '01000000cabfcd5b01bbfd9ff673b26e20ec3f4bd02252eb124883699bd881d63cde9582de54bba9f8000000006b483045022100d4302192de219a5a2d3c0ff9a6e60669031243bf94eae5cdad0031c813f0baea02204656145c113c6d144af80e6d9d2cfd0caa394180afa90ffd2197ec08bcf807380121034e9fef46313529347cddd19994817f446a3667a0652e57dc8cfe24a8c903f0f1ffffffff01301b0f00000000001976a914369df3cc0eb7acd7f0e0491a225a2ddad5ce3d4a88ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/feeTooHigh',
    };
};

export const signTransactionCapricoin = (): TestFunction => {
    const availableSubtests = {
        signCPC,
        oneTwoFee,
        twoTwoFee,
        notEnoughFunds,
        feeTooHigh,
    };
    return {
        testName: 'SignTransactionCapricoin',
        mnemonic: 'mnemonic_all',
        subtests: {
            ...availableSubtests,
        },
    };
};
