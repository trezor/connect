/* @flow */
declare module 'flowtype/tests/cardano-get-address' {
    declare export type TestCardanoGetAddressPayload = {
        method: string,
        path: string | Array<number>,
    };

    declare export type ExpectedCardanoGetAddressResponse = {
        success?: boolean,
        payload?: {
            address: string,
        },
    };
}
