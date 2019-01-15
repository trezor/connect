/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestHyconGetAddressPayload,
    ExpectedHyconGetAddressResponse,
} from 'flowtype/tests/hycon-get-address';

export const hyconGetAddress = (): TestFunction => {
    const testPayloads: Array<TestHyconGetAddressPayload> = [
        {
            method: 'hyconGetAddress',
            path: "m/44'/1397'/0'/0/0",
        },
        {
            method: 'hyconGetAddress',
            path: "m/44'/1397'/0'/0/1",
        },
        {
            method: 'hyconGetAddress',
            path: "m/44'/1397'/0'/0/2",
        },
    ];
    const expectedResponses: Array<ExpectedHyconGetAddressResponse> = [
        {
            payload: {
                address: 'HVRyJTaJSE21mUKavgR7ANLxdaFSDVRw',
            },
        },
        {
            payload: {
                address: 'HbsEvYxWkCSmAyWCsDLYjZiDRca97dy2',
            },
        },
        {
            payload: {
                address: 'H3EcMGojDVxPJvZ8G9MGWc5zk237F2JwZ',
            },
        },
    ];

    const testName = 'HyconGetAddress';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
