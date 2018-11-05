/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestEosGetPublicKeyPayload,
    ExpectedEosGetPublicKeyResponse,
} from 'flowtype/tests/eos-get-public-key';

export const eosGetPublicKey = (): TestFunction => {
    const testPayloads: Array<TestEosGetPublicKeyPayload> = [
        {
            method: 'eosGetPublicKey',
            path: "m/44'/194'/0'",
        },
        {
            method: 'eosGetPublicKey',
            path: [2147483692, 2147483842, 2147483648],
        },
        {
            method: 'eosGetPublicKey',
            path: "m/44'/194'/1'",
        },
        {
            method: 'eosGetPublicKey',
            path: [-1],
        },
        {
            method: 'eosGetPublicKey',
            path: [0, 1],
        },
    ];
    const expectedResponses: Array<ExpectedEosGetPublicKeyResponse> = [
        {
            payload: {
                wifPublicKey: 'EOS7zfpZgWSFGMPwwQoAQ1xhhY1SCXTzkTWxZ7xHDT7Ezg7zGotYW',
                rawPublicKey: '03991f2e2b5ba91012645925bafd77f43b920a53f487ae93ddb24377fccc2fb30c',
            },
        },
        {
            payload: {
                wifPublicKey: 'EOS7zfpZgWSFGMPwwQoAQ1xhhY1SCXTzkTWxZ7xHDT7Ezg7zGotYW',
                rawPublicKey: '03991f2e2b5ba91012645925bafd77f43b920a53f487ae93ddb24377fccc2fb30c',
            },
        },
        {
            payload: {
                wifPublicKey: 'EOS82CUpPnioFbSPqFr7DTk26dH1pzj7owEcU2nTQiioD4wjj88Py',
                rawPublicKey: '039c97bb3c2c2468112396fdbd608b1b6ec98dd3df9555f60a3cb3e6a0b1e7a0b2',
            },
        },
        { success: false },
        { success: false },
    ];
    const testName = 'EosGetPublicKey';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
