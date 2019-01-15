/* @flow */

declare module 'flowtype/tests/hycon-get-address' {
    declare export type TestHyconGetAddressPayload = {
        method: string,
        path: string | Array<number>,
    };

    declare export type ExpectedHyconGetAddressResponse = {
        payload: {
            address: string,
        },
    };
}
