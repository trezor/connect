/* @flow */

declare module 'flowtype/tests/lisk-get-address' {
    declare export type TestLiskGetAddressPayload = {
        method: string,
        method: string,
        path: string | Array<number>,
    };
    declare export type ExpectedLiskGetAddressResponse = {
        payload: {
            address: string,
        },
    };
}
