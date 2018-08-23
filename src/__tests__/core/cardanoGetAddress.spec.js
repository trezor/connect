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
            path: "m/44'/1815'/0'/0/0'",
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'",
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/1'",
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/2'",
        },
    ];

    const expectedResponses: Array<ExpectedCardanoGetAddressResponse> = [
        {
            payload: {
                address: 'DdzFFzCqrhst5m97LJq6P8x5ixpQJUAEurzas1kfTiV1uVyx5bKBqhRLjpTNaKKNsyKFCxfcoxVnDkbodL927Fjske2eEuyyXF4McGqd',
            },
        },
        { success: false },
        {
            payload: {
                address: 'sxtitePxjp5ubGrpqaAvBAck4S2AQNZeW67ZXb8Yg1Bs3kd5owZo8YEDRPNhuCZXcKDy93cGvtm6vP7jjPb43QWpBN',
            },
        },
        {
            payload: {
                address: '2w1sdSJu3GVfqnGAyqAdaWrN8Txv1vCZTN1Pe2AA54ysjWNbNzma3WVtSJfMc6HpM9KEQsdJ7oALPwfQWesRp8QDsFRQpzuNrdq',
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
