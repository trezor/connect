/* @flow */
declare module 'flowtype/tests/tezos-get-address' {
    declare export type TestTezosGetAddressPayload = {
        method: string,
        path: string | Array<number>,
        showOnTrezor: boolean,
    };

    declare export type ExpectedTezosGetAddressResponse = {
        success?: boolean,
        payload?: {
            address: string,
        },
    };
}
