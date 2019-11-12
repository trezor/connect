/* @flow */

import type {
    TestFunction,
    SubtestSignTransaction,
} from 'flowtype/tests';

type TransactionPayload = {
    method: string,
    path: string,
    transaction: any,
};

type ExpectedResponse = {
    payload: {
        public_key: string,
        signature: string,
    },
};

// vectors from https://github.com/binance-chain/javascript-sdk/blob/master/__tests__/fixtures/placeOrder.json
// https://github.com/trezor/trezor-firmware/blob/master/core/tests/test_apps.binance.sign_tx.py

const transfer = (): SubtestSignTransaction => {
    const testPayloads: Array<TransactionPayload> = [
        {
            method: 'binanceSignTransaction',
            path: "m/44'/714'/0'/0/0",
            transaction: {
                chain_id: 'Binance-Chain-Nile',
                account_number: 34,
                memo: 'test',
                sequence: 31,
                source: 1,
                transfer: {
                    inputs: [
                        {
                            address: 'tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd',
                            coins: [
                                { amount: 1000000000, denom: 'BNB' },
                            ],
                        },
                    ],
                    outputs: [
                        {
                            address: 'tbnb1ss57e8sa7xnwq030k2ctr775uac9gjzglqhvpy',
                            coins: [
                                { amount: 1000000000, denom: 'BNB' },
                            ],
                        },
                    ],
                },
            },
        },
    ];

    const expectedResponses: Array<ExpectedResponse> = [
        {
            payload: {
                public_key: '029729a52e4e3c2b4a4e52aa74033eedaf8ba1df5ab6d1f518fd69e67bbd309b0e',
                signature: 'faf5b908d6c4ec0c7e2e7d8f7e1b9ca56ac8b1a22b01655813c62ce89bf84a4c7b14f58ce51e85d64c13f47e67d6a9187b8f79f09e0a9b82019f47ae190a4db3',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/transfer',
    };
};

const placeOrder = (): SubtestSignTransaction => {
    const testPayloads: Array<TransactionPayload> = [
        {
            method: 'binanceSignTransaction',
            path: "m/44'/714'/0'/0/0",
            transaction: {
                chain_id: 'Binance-Chain-Nile',
                account_number: 34,
                memo: '',
                sequence: 32,
                source: 1,
                placeOrder: {
                    id: 'BA36F0FAD74D8F41045463E4774F328F4AF779E5-33',
                    ordertype: 2,
                    price: 100000000,
                    quantity: 100000000,
                    sender: 'tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd',
                    side: 1,
                    symbol: 'ADA.B-B63_BNB',
                    timeinforce: 1,
                },
            },
        },
    ];

    const expectedResponses: Array<ExpectedResponse> = [
        {
            payload: {
                public_key: '029729a52e4e3c2b4a4e52aa74033eedaf8ba1df5ab6d1f518fd69e67bbd309b0e',
                signature: '851fc9542342321af63ecbba7d3ece545f2a42bad01ba32cff5535b18e54b6d3106e10b6a4525993d185a1443d9a125186960e028eabfdd8d76cf70a3a7e3100',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/placeOrder',
    };
};

const cancelOrder = (): SubtestSignTransaction => {
    const testPayloads: Array<TransactionPayload> = [
        {
            method: 'binanceSignTransaction',
            path: "m/44'/714'/0'/0/0",
            transaction: {
                chain_id: 'Binance-Chain-Nile',
                account_number: 34,
                memo: '',
                sequence: 33,
                source: 1,
                cancelOrder: {
                    refid: 'BA36F0FAD74D8F41045463E4774F328F4AF779E5-29',
                    sender: 'tbnb1hgm0p7khfk85zpz5v0j8wnej3a90w709zzlffd',
                    symbol: 'BCHSV.B-10F_BNB',
                },
            },
        },
    ];

    const expectedResponses: Array<ExpectedResponse> = [
        {
            payload: {
                public_key: '029729a52e4e3c2b4a4e52aa74033eedaf8ba1df5ab6d1f518fd69e67bbd309b0e',
                signature: 'd93fb0402b2b30e7ea08e123bb139ad68bf0a1577f38592eb22d11e127f09bbd3380f29b4bf15bdfa973454c5c8ed444f2e256e956fe98cfd21e886a946e21e5',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/cancelOrder',
    };
};

export const binanceSignTransaction = (): TestFunction => {
    const subtests = {
        transfer,
        placeOrder,
        cancelOrder,
    };
    return {
        testName: 'BinanceSignTransaction',
        mnemonic: ['offer caution gift cross surge pretty orange during eye soldier popular holiday mention east eight office fashion ill parrot vault rent devote earth cousin'],
        mnemonic_secret: '6f666665722063617574696f6e20676966742063726f737320737572676520707265747479206f72616e676520647572696e672065796520736f6c6469657220706f70756c617220686f6c69646179206d656e74696f6e2065617374206569676874206f66666963652066617368696f6e20696c6c20706172726f74207661756c742072656e74206465766f746520656172746820636f7573696e',

        subtests,
    };
};
