/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestRippleGetAddressPayload,
    ExpectedRippleGetAddressResponse,
} from 'flowtype/tests/ripple-get-address';

export const rippleGetAddress = (): TestFunction => {
    const testPayloads: Array<TestRippleGetAddressPayload> = [
        {
            method: 'rippleGetAddress',
            path: "m/44'/144'/0'/0/0",
        },
        {
            method: 'rippleGetAddress',
            path: "m/44'/144'/0'/0/1",
        },
        {
            method: 'rippleGetAddress',
            path: "m/44'/144'/1'/0/0",
        },
    ];
    const expectedResponses: Array<ExpectedRippleGetAddressResponse> = [
        {
            payload: {
                address: 'rh5ZnEVySAy7oGd3nebT3wrohGDrsNS83E',
            },
        },
        {
            payload: {
                address: 'rwrZ3agNYYJw4yi6v1r7Ui9AwX9KsWzghr',
            },
        },
        {
            payload: {
                address: 'rEpwmtmvx8gkMhX5NLdU3vutQt7dor4MZm',
            },
        },
    ];

    const testName = 'RippleGetAddress';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
