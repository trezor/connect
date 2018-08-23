/* @flow */

declare module 'flowtype/tests/ripple-get-address' {
    declare export type TestRippleGetAddressPayload = {
        method: string,
        path: string | Array<number>,
    };

    declare export type ExpectedRippleGetAddressResponse = {
        payload: {
            address: string,
        },
    };
}
