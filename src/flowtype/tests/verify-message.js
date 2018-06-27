/* @flow */

declare module 'flowtype/tests/verify-message' {
    declare export type TestVerifyMessagePayload = {
        method: string,
        coin: string,
        address: string,
        signature: string,
        message: string,
    };

    declare export type ExpectedVerifyMessageResponse = {
        success: boolean,
    };
}
