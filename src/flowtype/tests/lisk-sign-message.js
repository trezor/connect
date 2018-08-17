/* @flow */

declare module 'flowtype/tests/lisk-sign-message' {
    declare export type TestLiskSignMessagePayload = {
        method: string,
        path: string,
        message: string,
    };

    declare export type ExpectedLiskSignMessageResponse = {
        payload: {
            public_key: string,
            signature: string,
        },
    };
}
