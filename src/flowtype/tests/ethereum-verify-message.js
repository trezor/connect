/* @flow */

declare module 'flowtype/tests/ethereum-verify-message' {
    declare export type TestEthereumVerifyMessagePayload = {
        method: string,
        address: string | Array<number>,
        signature: string,
        message: string,
    };

    declare export type ExpectedEthereumVerifyMessageResponse = {
        success: boolean,
    };
}