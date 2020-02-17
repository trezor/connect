/* @flow */
import type { TezosGetAddress } from '../../js/types';

export const tezosGetAddress = () => {
    const testPayloads: TezosGetAddress[] = [
        {
            method: 'tezosGetAddress',
            path: "m/44'/1729'/0'",
            showOnTrezor: false,
        },
        {
            method: 'tezosGetAddress',
            path: "m/44'/1729'/1'",
            showOnTrezor: false,
        },
        {
            method: 'tezosGetAddress',
            path: "m/44'/1729'",
            showOnTrezor: false,
        },
        {
            method: 'tezosGetAddress',
            path: "m/44'/1729'/0",
            showOnTrezor: false,
        },
    ];

    const expectedResponses = [
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

    return {
        testName: 'TezosGetAddress',
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
