/* @flow */

declare module 'flowtype/tests/nem-get-address' {
    declare export type TestNemGetAddressPayload = {
        method: string,
        path: string | Array<number>,
        network: number,
    };
    declare export type ExpectedNemGetAddressResponse = {
        payload: {
            address: string,
        },
    };
}
