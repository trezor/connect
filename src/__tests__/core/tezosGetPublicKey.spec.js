/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestTezosGetPublicKeyPayload,
    ExpectedTezosGetPublicKeyResponse,
} from 'flowtype/tests/tezos-get-public-key';

type ErrorResponse = {
    success: false,
}

export const tezosGetPublicKey = (): TestFunction => {
    const testPayloads: Array<TestTezosGetPublicKeyPayload> = [
        {
            method: 'tezosGetPublicKey',
            path: "m/44'/1729'/0'",
            showOnTrezor: false,
        },
        {
            method: 'tezosGetPublicKey',
            path: "m/44'/1729'/1'",
            showOnTrezor: false,
        },
        {
            method: 'tezosGetPublicKey',
            path: "m/44'/1729'",
            showOnTrezor: false,
        },
        {
            method: 'tezosGetPublicKey',
            path: "m/44'/1729'/0",
            showOnTrezor: false,
        },
    ];

    const expectedResponses: Array<ExpectedTezosGetPublicKeyResponse | ErrorResponse> = [
        {
            payload: {
                publicKey: 'edpkuxZ5W8c2jmcaGuCFZxRDSWxS7hp98zcwj2YpUZkJWs5F7UMuF6',
            },
        },
        {
            payload: {
                publicKey: 'edpkuVKVFyqTnp4axajmxTnCcSHN7v1kRhVpBC25GEZQVT2ZzSpdJY',
            },
        },
        { success: false },
        { success: false },
    ];

    const testName = 'TezosGetPublicKey';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
