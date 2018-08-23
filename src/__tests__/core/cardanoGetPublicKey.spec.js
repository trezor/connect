/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestCardanoGetPublicKeyPayload,
    ExpectedCardanoGetPublicKeyResponse,
} from 'flowtype/tests/cardano-get-public-key';

export const cardanoGetPublicKey = (): TestFunction => {
    const testPayloads: Array<TestCardanoGetPublicKeyPayload> = [
        {
            method: 'cardanoGetPublicKey',
            path: "m/44'/1815'/0'/0/0'",
        },
        {
            method: 'cardanoGetPublicKey',
            path: "m/44'/1815'",
        },
        {
            method: 'cardanoGetPublicKey',
            path: "m/44'/1815'/0/0/0",
        },
        {
            method: 'cardanoGetPublicKey',
            path: "m/44'/1815'/0'/0/0",
        },
    ];

    const expectedResponses: Array<ExpectedCardanoGetPublicKeyResponse> = [
        {
            payload: {
                publicKey: '5ed62999f3d181c86dfc932e2e0d9ce1d9067e6212b51629c700492f7f7e0bb19897025ed2b63debadcd858ca78864234c6c924b5b1c4c8a7d9b5b20b8d8fdb7',
            },
        },
        { success: false },
        {
            payload: {
                publicKey: '7342757bf48aebf82235f5f043b754f9a4f32090a6b71ef43f666cc87ef4ade25eb5aa8c1b99dc31633193198f04e30a517969ab0078767a392808b75b47eaec',
            },
        },
        {
            payload: {
                publicKey: '901fe8901937674e1536e5b0068d032bd2dc88e442e608b0438784be3c36c67fc5bf86092fb4aff15cb40606808d74ad71b33b6399e2da2811f98c105f154ecf',
            },
        },
    ];

    const testName = 'CardanoGetPublicKey';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
