/* @flow */

declare module 'flowtype/tests/lisk-verify-message' {
    declare export type TestLiskVerifyMessagePayload = {
        publicKey: string,
        signature: string,
        message: string,
    };

    declare export type ExpectedLiskVerifyMessageResponse = {
        success: boolean,
    };
}
