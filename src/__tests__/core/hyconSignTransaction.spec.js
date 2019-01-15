/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestHyconSignTransactionPayload,
    ExpectedHyconSignTransactionResponse,
} from 'flowtype/tests/hycon-sign-transaction';

export const hyconSignTransaction = (): TestFunction => {
    const testPayloads: Array<TestHyconSignTransactionPayload> = [
        {
            method: 'hyconSignTransaction',
            path: "m/44'/1397'/0'/0/0",
            transaction: {
                fee: '0.000000001',
                amount: '0.000000001',
                nonce: 1024,
                to: 'H497fHm8gbPZxaXySKpV17a7beYBF9Ut3',
            },
        },
        {
            method: 'hyconSignTransaction',
            path: "m/44'/1397'/0'/0/0",
            transaction: {
                fee: '123.000000001',
                amount: '123456789.987654321',
                nonce: 1,
                to: 'HwTsQGpbicAZsXcmSHN8XmcNR9wXHtw7',
            },
        },
        {
            method: 'hyconSignTransaction',
            path: "m/44'/1397'/0'/0/0",
            transaction: {
                fee: '10000000.000000001',
                amount: '760591852.557887402',
                nonce: 17,
                to: 'HwTsQGpbicAZsXcmSHN8XmcNR9wXHtw7',
            },
        },
    ];

    const expectedResponses: Array<ExpectedHyconSignTransactionResponse> = [
        {
            payload: {
                signature: '5fca82f06c3ab0b42bc5c81f56273abd080c76456b37f6c7cc7d0e2cc789c60972a38c981685ea0cf8bf9e61f8839edce2f3fdede4b86f6a0f932a88d635a5bd',
                recovery: 1,
                txhash: 'f628c438106566a50bf60e6bb2ba428b4597f364dbfd3734a74a0591639e6c66',
            },
        },
        {
            payload: {
                signature: '453547f199abb4a37ed39f8f7059e2c453d6d0486f4a6f850169e5b1518126483a219b7d7310abd0f487d8d2e730bdc971b7fa93b950cf2d685fccdbf3e04f82',
                recovery: 0,
                txhash: '8e9c9e4606d9b06208200c1b34e86383d68e17ec7de2052ecaa75800e3b734e0',
            },
        },
        {
            payload: {
                signature: 'c259563b6d2398b05fbfd72a444a5b7065626c65a4733f6c7e02eea76029c1ac3006fb93abd7836230e988e99b35b755b76c5601fd75ad32d57262ea51fb2622',
                recovery: 1,
                txhash: 'dd17df507f20e8bbc453691f182f7cab53bf9e27dc221dd214021a97e48fafc9',
            },
        },
        { success: false },
    ];

    const testName = 'HyconSignTransaction';
    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
