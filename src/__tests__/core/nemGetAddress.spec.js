/* @flow */
import { NEM_MAINNET, NEM_TESTNET } from '../../js/core/methods/helpers/nemSignTx.js';

import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestNemGetAddressPayload,
    ExpectedNemGetAddressResponse,
} from 'flowtype/tests/nem-get-address';

export const nemGetAddress = (): TestFunction => {
    const testPayloads: Array<TestNemGetAddressPayload> = [
        {
            method: 'nemGetAddress',
            path: "m/44'/1'/0'/0'/0'",
            network: NEM_MAINNET,
        },
        {
            method: 'nemGetAddress',
            path: "m/44'/1'/0'/0'/0'",
            network: NEM_TESTNET,
        },
    ];
    const expectedResponses: Array<ExpectedNemGetAddressResponse> = [
        {
            payload: {
                address: 'NB3JCHVARQNGDS3UVGAJPTFE22UQFGMCQGHUBWQN',
            },
        },
        {
            payload: {
                address: 'TB3JCHVARQNGDS3UVGAJPTFE22UQFGMCQHSBNBMF',
            },
        },
    ];
    const testName = 'NemGetAddress';

    return {
        testPayloads,
        expectedResponses,
        testName,
        mnemonic: 'mnemonic_12',
    };
};
