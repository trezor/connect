/* @flow */

declare module 'flowtype/tests/get-address' {
    declare export type TestGetAddressPayload = {
        method: string,
        path: string | Array<number>,
        coin: string,
        showOnTrezor: boolean,
    };
    declare export type ExpectedGetAddressResponse = {
        payload: {
            address: string,
        },
    };
}
