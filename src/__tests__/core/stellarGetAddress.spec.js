/* @flow */
import type { StellarGetAddress } from '../../js/types';

// https://github.com/trezor/trezor-firmware/blob/master/tests/device_tests/test_msg_stellar_get_address.py

export const stellarGetAddress = () => {
    const testPayloads: StellarGetAddress[] = [
        {
            method: 'stellarGetAddress',
            path: "m/44'/148'/0'",
        },
        {
            method: 'stellarGetAddress',
            path: "m/44'/148'/1'",
        },
        {
            method: 'stellarGetAddress',
            path: "m/44'/148'",
        },
        {
            method: 'stellarGetAddress',
            path: [0],
        },
    ];
    const expectedResponses = [
        {
            payload: {
                address: 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6',
            },
        },
        {
            payload: {
                address: 'GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX',
            },
        },
        { success: false },
        { success: false },
    ];

    return {
        testName: 'stellarGetAddress',
        mnemonic: ['illness spike retreat truth genius clock brain pass fit cave bargain toe'],
        testPayloads,
        expectedResponses,
    };
};

