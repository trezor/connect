/* @flow */

import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestCardanoSignTransactionPayload,
    ExpectedCardanoSignTransactionResponse,
} from 'flowtype/tests/cardano-sign-transaction';

export const cardanoSignTransaction = (): TestFunction => {
    const inputs = [
        {
            prev_hash: '1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc',
            path: "m/44'/1815'/0'/0/1",
            // address_n: [2147483692, 2147485463, 2147483648, 0, 1],
            prev_index: 0,
            type: 0,
        },
    ];
    const outputs = [
        {
            address: 'Ae2tdPwUPEZCanmBz5g2GEwFqKTKpNJcGYPKfDxoNeKZ8bRHr8366kseiK2',
            amount: '3003112',
        },
    ];
    const transactions = [
        '839f8200d818582482582008abb575fac4c39d5bf80683f7f0c37e48f4e3d96e37d1f6611919a7241b456600ff9f8282d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a00305becffa0',
    ];

    const testPayloads: Array<TestCardanoSignTransactionPayload> = [
        {
            method: 'cardanoSignTransaction',
            inputs,
            outputs,
            transactions,
            network: 2,
        },
    ];

    const expectedResponses: Array<ExpectedCardanoSignTransactionResponse> = [
        {
            payload: {
                hash: '799c65e8a2c0b1dc4232611728c09d3f3eb0d811c077f8e9798f84605ef1b23d',
                body: '82839f8200d81858248258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00ff9f8282d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e8ffa0818200d818588582584089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea26308151516f3b0e02bb1638142747863c520273ce9bd3e5cd91e1d46fe2a6355840312c01c27317415b0b8acc86aa789da877fe7e15c65b7ea4c4565d8739117f5f6d9d38bf5d058f7be809b2b9b06c1d79fc6b20f9a4d76d8c89bae333edf5680c',
            },
        },
    ];

    const testName = 'CardanoSignTransaction';

    return {
        testName,
        testPayloads,
        expectedResponses,
    };
};
