/* @flow */

declare module 'flowtype/tests/get-address' {
    declare export type TestAddressPayload = {
        method: string,
        path: string | Array<number>,
        coin?: string,
        showOnTrezor?: boolean,
        network?: number,
    };
    declare export type ExpectedAddressResponse = {
        payload: {
            address: string,
        },
    };
}
