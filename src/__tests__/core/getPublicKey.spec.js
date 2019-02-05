/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestGetPublicKeyPayload,
    ExpectedGetPublicKeyResponse,
} from 'flowtype/tests/get-public-key';

export const getPublicKey = (): TestFunction => {
    const testPayloads: Array<TestGetPublicKeyPayload> = [
        {
            method: 'getPublicKey',
            coin: 'btc',
            path: "m/49'/0'/0'",
        },
        {
            method: 'getPublicKey',
            coin: 'btc',
            path: [2147483697, 2147483648, 2147483648],
        },
        {
            method: 'getPublicKey',
            coin: 'btc',
            path: [-1],
        },
        {
            method: 'getPublicKey',
            coin: 'btc',
            path: [0, 1],
        },
    ];
    const expectedResponses: Array<ExpectedGetPublicKeyResponse> = [
        {
            payload: {
                xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
            },
        },
        {
            payload: {
                xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
            },
        },
        { success: false },
        { success: false },
    ];
    const testName = 'GetPublicKey';

    return {
        testPayloads,
        expectedResponses,
        testName,
        mnemonic: 'mnemonic_12',
    };
};
