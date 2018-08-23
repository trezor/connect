/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestCardanoSignMessagePayload,
    ExpectedCardanoSignMessageResponse,
} from 'flowtype/tests/cardano-sign-message';

export const cardanoSignMessage = (): TestFunction => {
    const testPayloads: Array<TestCardanoSignMessagePayload> = [
        {
            method: 'cardanoSignMessage',
            path: "m/44'/1815'/0'/0/0'",
            message: 'Test message to sign',
        },
        {
            method: 'cardanoSignMessage',
            path: "m/44'/1815'/0/0/0",
            message: 'Another Test message to sign',
        },
        {
            method: 'cardanoSignMessage',
            path: "m/44'/1815'/0'/0/0",
            message: 'Just another Test message to sign',
        },
    ];

    const expectedResponses: Array<ExpectedCardanoSignMessageResponse> = [
        {
            payload: {
                signature: '61f291bfabbee732f7b7b275c96fb37d9dff43e01a04fda8695f8623911ab00f9ac0626697c7a48f46c3d7942e9db4dca4cc603ecea0aa735fa3057ac8e80a0f',
            },
        },
        {
            payload: {
                signature: '368fd6f0d9688d2c6bf5b680c2a7e6bf6a51edc23a3526e2512d840b684874e174a1bbb316b01bfd629e90263566902e1e6dff7ad4ab07507a0d6e340aab3a04',
            },
        },
        {
            payload: {
                signature: 'bfc20bcc1740f6ff514d4d301432ab1f079ae0e990880488c75c65a28beb9ac8608389193331922ba64566ca0af3b401c4588b4f4d444a11b5c706cf15e1ea01',
            },
        },
    ];

    const testName = 'CardanoSignMessage';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
