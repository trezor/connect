/* @flow */

declare module 'flowtype/tests/get-public-key' {
    declare export type TestGetPublicKeyPayload = {
        method: string,
        path: string | Array<number>,
        coin: string,
    };
    declare export type ExpectedGetPublicKeyResponse = {
        payload: {
            xpub: string,
        },
    };
}