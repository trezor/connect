/* @flow */

import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestLiskGetAddressPayload,
    ExpectedLiskGetAddressResponse,
} from 'flowtype/tests/lisk-get-address';

export const liskGetAddress = (): TestFunction => {
    const testPayloads: Array<TestLiskGetAddressPayload> = [
        {
            method: 'liskGetAddress',
            path: "m/44'/134'/0'",
        },
        {
            method: 'liskGetAddress',
            path: "m/44'/134'/0'/1'",
        },
        {
            method: 'liskGetAddress',
            path: "m/44'/134'/0'/0'/1'",
        },
    ];

    const expectedResponses: Array<ExpectedLiskGetAddressResponse> = [
        {
            payload: {
                address: '17563781916205589679L',
                publicKey: '8bca6b65a1a877767b746ea0b3c4310d404aa113df99c1b554e1802d70185ab5',
            },
        },
        {
            payload: {
                address: '1874186517773691964L',
                publicKey: 'a129381c1c077f9d8cb70ac48dcbbf3535bd4d5767dc363438e95fb9f1211704',
            },
        },
        {
            payload: {
                address: '10017405670757635096L',
                publicKey: 'fd697bbc54db919215ac9c527a4996256f29952cc209fb4e550c530d891aabf1',
            },
        },
    ];

    const testName = 'LiskGetAddress';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
