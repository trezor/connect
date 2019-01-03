/* @flow */
declare module 'flowtype/tests/tezos-get-public-key' {
    declare export type TestTezosGetPublicKeyPayload = {
        method: string,
        path: string | Array<number>,
        showOnTrezor: boolean,
    };

    declare export type ExpectedTezosGetPublicKeyResponse = {
        success?: boolean,
        payload?: {
            publicKey: string,
        },
    };
}
