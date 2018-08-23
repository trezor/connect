/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestCardanoVerifyMessagePayload,
    ExpectedCardanoVerifyMessageResponse,
} from 'flowtype/tests/cardano-verify-message';

export const cardanoVerifyMessage = (): TestFunction => {
    const testPayloads: Array<TestCardanoVerifyMessagePayload> = [
        {
            method: 'cardanoVerifyMessage',
            message: 'Test message to sign',
            publicKey: '5ed62999f3d181c86dfc932e2e0d9ce1d9067e6212b51629c700492f7f7e0bb1',
            signature: '61f291bfabbee732f7b7b275c96fb37d9dff43e01a04fda8695f8623911ab00f9ac0626697c7a48f46c3d7942e9db4dca4cc603ecea0aa735fa3057ac8e80a0f',
        },
        {
            method: 'cardanoVerifyMessage',
            message: 'Another Test message to sign',
            publicKey: '7342757bf48aebf82235f5f043b754f9a4f32090a6b71ef43f666cc87ef4ade2',
            signature: '368fd6f0d9688d2c6bf5b680c2a7e6bf6a51edc23a3526e2512d840b684874e174a1bbb316b01bfd629e90263566902e1e6dff7ad4ab07507a0d6e340aab3a04',
        },
        {
            method: 'cardanoVerifyMessage',
            message: 'Just another Test message to sign',
            publicKey: '901fe8901937674e1536e5b0068d032bd2dc88e442e608b0438784be3c36c67f',
            signature: 'bfc20bcc1740f6ff514d4d301432ab1f079ae0e990880488c75c65a28beb9ac8608389193331922ba64566ca0af3b401c4588b4f4d444a11b5c706cf15e1ea01',
        },
    ];

    const expectedResponses: Array<ExpectedCardanoVerifyMessageResponse> = [
        { success: true },
        { success: true },
        { success: true },
    ];

    const testName = 'CardanoVerifyMessage';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
