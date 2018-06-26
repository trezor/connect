/* @flow */


declare module 'flowtype/tests' {
    declare export type Subtest = {
        testPayloads: Array<TestPayload>,
        expectedResponses: Array<ExpectedResponse>,
        specName: string,
    };

    import type {
        TestAddressPayload,
        ExpectedAddressResponse,
    } from 'flowtype/tests/get-address';
    declare type TestPayload = TestAddressPayload;
    declare type ExpectedResponse = ExpectedAddressResponse;
}
