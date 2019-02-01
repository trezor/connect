/* @flow */

import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestCardanoGetAddressPayload,
    ExpectedCardanoGetAddressResponse,
} from 'flowtype/tests/cardano-get-address';

export const cardanoGetAddress = (): TestFunction => {
    const testPayloads: Array<TestCardanoGetAddressPayload> = [
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/0",
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'",
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/1",
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/2",
        },
    ];

    // responses from https://github.com/trezor/trezor-core/blob/master/tests/test_apps.cardano.address.py#L71
    const expectedResponses: Array<ExpectedCardanoGetAddressResponse> = [
        {
            payload: {
                address: 'Ae2tdPwUPEZ5YUb8sM3eS8JqKgrRLzhiu71crfuH2MFtqaYr5ACNRdsswsZ',
            },
        },
        { success: false },
        {
            payload: {
                address: 'Ae2tdPwUPEZJb8r1VZxweSwHDTYtqeYqF39rZmVbrNK62JHd4Wd7Ytsc8eG',
            },
        },
        {
            payload: {
                address: 'Ae2tdPwUPEZFm6Y7aPZGKMyMAK16yA5pWWKU9g73ncUQNZsAjzjhszenCsq',
            },
        },
    ];

    const testName = 'CardanoGetAddress';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
