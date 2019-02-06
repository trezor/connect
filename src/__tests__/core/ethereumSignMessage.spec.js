/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestEthereumSignMessagePayload,
    ExpectedEthereumSignMessageResponse,
} from 'flowtype/tests/ethereum-sign-message';

export const ethereumSignMessage = (): TestFunction => {
    const testPayloads: Array<TestEthereumSignMessagePayload> = [
        {
            method: 'ethereumSignMessage',
            path: "m/44'/60'/0'",
            message: 'This is an example of a signed message.',
        },
        {
            method: 'ethereumSignMessage',
            path: "m/44'/60'/0'",
            message: 'VeryLongMessage!'.repeat(64),
        },
    ];
    const expectedResponses: Array<ExpectedEthereumSignMessageResponse> = [
        {
            payload: {
                address: '0xAE2B111b634f8FB3942B13b98c824B0F1060cacB',
                signature: '9dc221f51fe1515d598324e51c1897637c3f0098b02758fa68a794803495df061ddbc1460b40497a80f3b1bf63e5966850c3bbd8ff91e0e9f4d7a121be32b1c21c',
            },
        },
        {
            payload: {
                address: '0xAE2B111b634f8FB3942B13b98c824B0F1060cacB',
                signature: '076d6dcf1fdcac60748919a781dc39d0ee7beece5fd5604be2f061e32ec6d91817562df343171ab38214fa3e2de46240ab330da34011856e2461378940243ec91c',
            },
        },
    ];
    const testName = 'EthereumSignMessage';

    return {
        testPayloads,
        expectedResponses,
        testName,
        mnemonic: 'mnemonic_12',
    };
};
