/* @flow */

declare module 'flowtype/tests/sign-message' {
    declare export type TestSignMessagePayload = {
        method: string,
        path: string | Array<number>,
        message: string,
        coin?: string,
    };

    declare export type ExpectedSignMessageResponse = {
        payload: {
            address: string,
            signature: string,
        },
    };
}
