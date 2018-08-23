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
            path: "m/44'/43'/0'",
        },
        {
            method: 'ethereumGetAddress',
            path: [2147483692, 2147483691, 2147483648],
        },
        {
            method: 'ethereumGetAddress',
            path: "m/44'/43'/1'",
        },
        {
            method: 'ethereumGetAddress',
            path: [-1],
        },
        {
            method: 'ethereumGetAddress',
            path: [0, 1],
        },
    ];
    const expectedResponses: Array<ExpectedEthereumGetAddressResponse> = [
        {
            payload: {
                address: '0x6ae2F16e73Aeac6A2Bbc46cc98a1D2e23661E6Fe',
            },
        },
        {
            payload: {
                address: '0x6ae2F16e73Aeac6A2Bbc46cc98a1D2e23661E6Fe',
            },
        },
        {
            payload: {
                address: '0x64c97F1954602eF09b950aBa4B0d172ACe043392',
            },
        },
        { success: false },
        { success: false },
    ];
    const testName = 'EthereumGetAddress';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
