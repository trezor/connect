/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestEthereumGetAddressPayload,
    ExpectedEthereumGetAddressResponse,
} from 'flowtype/tests/ethereum-get-address';

export const ethereumGetAddress = (): TestFunction => {
    const testPayloads: Array<TestEthereumGetAddressPayload> = [
        {
            method: 'ethereumGetAddress',
            path: "m/44'/60'/1",
        },
        {
            method: 'ethereumGetAddress',
            path: "m/44'/60'/0/1'",
        },
        {
            method: 'ethereumGetAddress',
            path: "m/44'/60'/0'/9'/0",
        },
        {
            method: 'ethereumGetAddress',
            path: "m/44'/160'/0'/0/0",
        },
        {
            method: 'ethereumGetAddress',
            path: "m/44'/199'/0'/0/9999",
        },
    ];
    const expectedResponses: Array<ExpectedEthereumGetAddressResponse> = [
        {
            payload: {
                address: '0xeD46C856D0c79661cF7d40FFE0C0C5077c00E898',
            },
        },
        {
            payload: {
                address: '0x6682Fa7F3eC58581b1e576268b5463B4b5c93839',
            },
        },
        {
            payload: {
                address: '0x2cffCE5B7DA9584caD519EFc4715425b630CEF3a',
            },
        },
        { success: false },
        { success: false },
    ];

    return {
        testName: 'EthereumGetAddress',
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};
