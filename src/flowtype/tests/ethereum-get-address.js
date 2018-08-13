/* @flow */

declare module 'flowtype/tests/ethereum-get-address' {
    declare export type TestEthereumGetAddressPayload = {
        method: string,
        path: string | Array<number>,
    };

    declare export type ExpectedEthereumGetAddressResponse = {
        payload: {
            address: string,
        },
    };
}
