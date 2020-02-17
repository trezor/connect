/* @flow */
import type { NEMGetAddress } from '../../js/types';
import { NEM_MAINNET, NEM_TESTNET } from '../../js/core/methods/helpers/nemSignTx.js';

export const nemGetAddress = () => {
    const testPayloads: NEMGetAddress[] = [
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
    const expectedResponses = [
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
