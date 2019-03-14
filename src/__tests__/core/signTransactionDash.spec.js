/* @flow */
import type {
    TestFunction,
    SubtestSignTransaction,
} from 'flowtype/tests';
import type {
    TestSignTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

const normalTx = (): SubtestSignTransaction => {
    // See https://dash1.trezor.io/tx/be1af4a0e1eaccf86767836b42ee0938cceba16d0dd6c283f476db692c961f41
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Dash',
            inputs: [
                {
                    address_n: [2147483692, 2147483653, 2147483648, 0, 0],
                    prev_hash: '24522992fb42f85d2d43efa3a1ddb98de23ed28583e19128e6e200a9fa6bc665',
                    prev_index: 1,
                },
            ],
            outputs: [
                {
                    address: 'XnD5rf5CsAo68wr2h9Nod58whcxX94VvqQ',
                    amount: '998060',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '010000000165c66bfaa900e2e62891e18385d23ee28db9dda1a3ef432d5df842fb92295224010000006a473044022061db2e7970f5cc6a8bbd1547103f28558e36177862e8fc13ea5b69dd199b52560220277451bb5ce650a95e5f67019ca0ddaa1fef221310c52bd1919e54a5caae5b4b012102936f80cac2ba719ddb238646eb6b78a170a55a52a9b9f08c43523a4a6bd5c896ffffffff01ac3a0f00000000001976a9147e6191bd0404cb41ed67e041bd674e2a5c9d280188ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/normalTx',
    };
};

// NOTE: this is not a valid transaction
const specialInput = (): SubtestSignTransaction => {
    // Input from https://dash1.trezor.io/tx/adb43bcd8fc99d6ed353c30ca8e5bd5996cd7bcf719bd4253f103dfb7227f6ed
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Dash',
            inputs: [
                {
                    address_n: [2147483692, 2147483653, 2147483648, 0, 0],
                    prev_hash: 'adb43bcd8fc99d6ed353c30ca8e5bd5996cd7bcf719bd4253f103dfb7227f6ed',
                    prev_index: 0,
                },
            ],
            outputs: [
                {
                    address: 'XkNPrBSJtrHZUvUqb3JF4g5rMB3uzaJfEL',
                    amount: '167000000',
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serializedTx: '0100000001edf62772fb3d103f25d49b71cf7bcd9659bde5a80cc353d36e9dc98fcd3bb4ad000000006b483045022100f7f940f5e3ca4cbe5d787d2dfb121dc56cd224da647b17a170e5e03b29e68744022002cc9d9d6b203180d1f68e64ba8a73fd9e983cca193b7bcf94e0156ed245bdfa012102936f80cac2ba719ddb238646eb6b78a170a55a52a9b9f08c43523a4a6bd5c896ffffffff01c037f409000000001976a9146a341485a9444b35dc9cb90d24e7483de7d37e0088ac00000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/specialInput',
    };
};

// NOTE: this is not a valid transaction

export const signTransactionDash = (): TestFunction => {
    const availableSubtests = {
        normalTx,
        specialInput,
    };
    return {
        testName: 'SignTransactionDash',
        mnemonic: 'mnemonic_all',
        subtests: {
            ...availableSubtests,
        },
    };
};
