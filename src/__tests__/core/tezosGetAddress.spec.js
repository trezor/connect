/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestTezosGetAddressPayload,
    ExpectedTezosGetAddressResponse,
} from 'flowtype/tests/tezos-get-address';

type ErrorResponse = {
    success: false,
}

export const tezosGetAddress = (): TestFunction => {
    const testPayloads: Array<TestTezosGetAddressPayload> = [
        {
            method: 'tezosGetAddress',
            path: "m/44'/1729'/0'",
            showOnTrezor: true,
        },
        {
            method: 'tezosGetAddress',
            path: "m/44'/1729'/1'",
            showOnTrezor: true,
        },
        {
            method: 'tezosGetAddress',
            path: "m/44'/1729'",
            showOnTrezor: true,
        },
        {
            method: 'tezosGetAddress',
            path: "m/44'/1729'/0",
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedTezosGetAddressResponse | ErrorResponse> = [
        {
            payload: {
                address: 'tz1ckrgqGGGBt4jGDmwFhtXc1LNpZJUnA9F2',
            },
        },
        {
            payload: {
                address: 'tz1cTfmc5uuBr2DmHDgkXTAoEcufvXLwq5TP',
            },
        },
        { success: false },
        { success: false },
    ];

    const testName = 'TezosGetAddress';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
