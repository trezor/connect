/* @flow */

declare module 'flowtype/tests/ethereum-sign-message' {
    declare export type TestEthereumSignMessagePayload = {
        method: string,
        path: string | Array<number>,
        message: string,
    };
    declare export type ExpectedEthereumSignMessageResponse = {
        payload: {
            address: string,
            signature: string,
        },
    };
}
