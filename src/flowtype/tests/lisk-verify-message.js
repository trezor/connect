/* @flow */

declare module 'flowtype/tests/lisk-verify-message' {
    declare export type TestLiskVerifyMessagePayload = {
        method: string,
        public_key: string,
        signature: string,
        message: string,
    };

    declare export type ExpectedLiskVerifyMessageResponse = {
        success: boolean,
    };
}
