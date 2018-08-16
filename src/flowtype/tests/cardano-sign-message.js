/* @flow */

declare module 'flowtype/tests/cardano-sign-message' {
    declare export type TestCardanoSignMessagePayload = {
        path: string,
        message: string,
    };

    declare export type ExpectedCardanoSignMessageResponse = {
        payload: {
            signature: string,
        },
    };
}
