/* @flow */

import type {
    TestGetPublicKeyPayload
} from 'flowtype/tests/get-public-key';

declare module 'flowtype/tests/passphrase' {
    declare export type TestPassphrasePayload = {
        method: 'getPublicKey',
        coin: 'btc',
        path: "m/49'/0'/0'",
        passphrase: string,
        state: string,
    };

    declare export type ExpectedPassphraseResponse = {
        success?: boolean,
        payload?: {
            xpub: string,
        },
    };
}