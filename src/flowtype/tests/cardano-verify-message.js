/* @flow */

declare module 'flowtype/tests/cardano-verify-message' {
    declare export type TestCardanoVerifyMessagePayload = {
        publicKey: string,
        signature: string,
        message: string,
    };

    declare export type ExpectedCardanoVerifyMessageResponse = {
        success: boolean,
    };
}