/* @flow */

declare module 'flowtype/tests/cardano-get-public-key' {
    declare export type TestCardanoGetPublicKeyPayload = {
        method: string,
        path: string | Array<number>,
    };

    declare export type ExpectedCardanoGetPublicKeyResponse = {
        success?: boolean,
        payload?: {
            publicKey: string,
        },
    };
}
