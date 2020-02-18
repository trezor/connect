/* @flow */
import type { GetAddress } from '../../js/types';

const multisig = {
    pubkeys: [
        {
            node: 'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy',
            address_n: [1],
        },
        {
            node: 'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy',
            address_n: [2],
        },
        {
            node: 'xpub661MyMwAqRbcF1zGijBb2K6x9YiJPh58xpcCeLvTxMX6spkY3PcpJ4ABcCyWfskq5DDxM3e6Ez5ePCqG5bnPUXR4wL8TZWyoDaUdiWW7bKy',
            address_n: [3],
        },
    ],
    signatures: ['', '', ''],
    m: 2,
};

const showMultisigAddress = () => {
    const testPayloads: GetAddress[] = [
        {
            method: 'getAddress',
            path: [1],
            multisig,
            scriptType: 'SPENDMULTISIG',
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            path: [2],
            multisig,
            scriptType: 'SPENDMULTISIG',
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            path: [3],
            multisig,
            scriptType: 'SPENDMULTISIG',
            showOnTrezor: true,
        },
    ];
    const expectedResponses = [
        {
            payload: {
                address: '3E7GDtuHqnqPmDgwH59pVC7AvySiSkbibz',
            },
        },
        {
            payload: {
                address: '3E7GDtuHqnqPmDgwH59pVC7AvySiSkbibz',
            },
        },
        {
            payload: {
                address: '3E7GDtuHqnqPmDgwH59pVC7AvySiSkbibz',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/showMultisigAddress',
    };
};

export const getAddressMultisig = () => {
    return {
        subtests: {
            showMultisigAddress,
        },
        testName: 'getAddressMultisig',
        mnemonic: 'mnemonic_12',
    };
};
