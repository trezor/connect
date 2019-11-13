/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestCardanoGetPublicKeyPayload,
    ExpectedCardanoGetPublicKeyResponse,
} from 'flowtype/tests/cardano-get-public-key';

// https://github.com/trezor/trezor-firmware/blob/master/core/tests/test_apps.cardano.get_public_key.py

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
                publicKey: 'a938c8554ae04616cfaae7cd0eb557475082c4e910242ce774967e0bd7492408cbf6ab47c8eb1a0477fc40b25dbb6c4a99454edb97d6fe5acedd3e238ef46fe0',
            },
        },
        {
            success: false, // invalid path
            // payload: {
            //     publicKey: '8c47ebce34234d04fd3dfbac33feaba6133e4e3d77c4b5ab18120ec6878ad4ce02ac67c59a8b0264724a635774ca2c242afa10d7ab70e2bf0a8f7d4bb10f1f7a',
            // },
        },
        {
            payload: {
                publicKey: '17cc0bf978756d0d5c76f931629036a810c61801b78beecb44555773d13e3791646ac4a6295326bae6831be05921edfbcb362de48dfd37b12e74c227dfad768d',
            },
        },
        {
            payload: {
                publicKey: 'b90fb812a2268e9569ff1172e8daed1da3dc7e72c7bded7c5bcb7282039f90d5fd8e71c1543de2cdc7f7623130c5f2cceb53549055fa1f5bc88199989e08cce7',
            },
        },
    ];

    const testName = 'CardanoGetPublicKey';

    return {
        testName,
        mnemonic: 'mnemonic_all',
        testPayloads,
        expectedResponses,
    };
};
