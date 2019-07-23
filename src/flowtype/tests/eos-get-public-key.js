
/* @flow */

declare module 'flowtype/tests/eos-get-public-key' {
    declare export type TestEosGetPublicKeyPayload = {
        method: string,
        path: string | Array<number>,
    };

    declare export type ExpectedEosGetPublicKeyResponse = {
        payload: {
            wifPublicKey: string,
            rawPublicKey: string,
        },
    };
}
