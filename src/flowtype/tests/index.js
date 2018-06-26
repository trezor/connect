/* @flow */

declare module 'flowtype/tests' {
    declare export type Subtest = {
        testPayloads: Array<TestPayload>,
        expectedResponses: Array<ExpectedResponse>,
        specName: string,
    };

    import {
        type TestAddressPayload,
        type ExpectedAddressResponse,
    } from 'flowtype/tests/get-address';
    import type {
        TestSignMessagePayload,
        ExpectedSignMessageResponse,
    } from 'flowtype/tests/sign-message';
    declare type TestPayload = TestAddressPayload | TestSignMessagePayload;
    declare type ExpectedResponse = ExpectedAddressResponse | ExpectedSignMessageResponse;
}
