/* @flow */
import type { LiskGetAddress } from '../../js/types';

export const liskGetAddress = () => {
    const testPayloads: LiskGetAddress[] = [
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

    const expectedResponses = [
        {
            payload: {
                address: '17563781916205589679L',
            },
        },
        {
            payload: {
                address: '1874186517773691964L',
            },
        },
        {
            payload: {
                address: '10017405670757635096L',
            },
        },
    ];

    const testName = 'LiskGetAddress';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
