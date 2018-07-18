/* @flow */

import type {
    TestGetPublicKeyPayload
} from 'flowtype/tests/get-public-key';

declare module 'flowtype/tests/passphrase' {
    declare export type TestPassphrasePayload = {
        message: TestGetPublicKeyPayload,
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