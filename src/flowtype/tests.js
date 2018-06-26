/* @flow */

declare module 'flowtype/tests' {
    declare type TestPayload = TestAddressPayload;
    declare type ExpectedResponse = ExpectedAddressResponse;

    declare export type Subtest = {
        testPayloads: Array<TestPayload>,
        expectedResponses: Array<ExpectedResponse>,
        specName: string,
    };

    declare export type TestAddressPayload = {
        method: string,
        path: string | Array<number>,
        coin?: string,
        showOnTrezor?: boolean,
    };
    declare export type ExpectedAddressResponse = {
        payload: {
            address: string,
        },
    };
}
