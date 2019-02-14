/* @flow */
import type {
    TestFunction,
    SubtestGetAddress,
} from 'flowtype/tests';
import type {
    TestGetAddressPayload,
    ExpectedGetAddressResponse,
} from 'flowtype/tests/get-address';

const btc = (): SubtestGetAddress => {
    const testPayloads: Array<TestGetAddressPayload> = [
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'/0/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: [2147483697, 2147483648, 2147483648, 0, 0],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: "m/49'/1'/0'/0/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: [-1],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: [0, 1],
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedGetAddressResponse> = [
        {
            payload: {
                address: '3AnYTd2FGxJLNKL1AzxfW3FJMntp9D2KKX',
            },
        },
        {
            payload: {
                address: '3AnYTd2FGxJLNKL1AzxfW3FJMntp9D2KKX',
            },
        },
        { success: false },
        { success: false },
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/btc',
    };
};

const ltc = (): SubtestGetAddress => {
    const testPayloads: Array<TestGetAddressPayload> = [
        {
            method: 'getAddress',
            coin: 'Litecoin',
            path: "m/49'/2'/0'/0/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Litecoin',
            path: [2147483697, 2147483650, 2147483648, 0, 0],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Litecoin',
            path: "m/49'/1'/0'/0/0",
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedGetAddressResponse> = [
        {
            payload: {
                address: 'MFoQRU1KQq365Sy3cXhix3ygycEU4YWB1V',
            },
        },
        {
            payload: {
                address: 'MFoQRU1KQq365Sy3cXhix3ygycEU4YWB1V',
            },
        },
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/ltc',
    };
};

const tbtc = (): SubtestGetAddress => {
    const testPayloads: Array<TestGetAddressPayload> = [
        {
            method: 'getAddress',
            coin: 'Testnet',
            path: "m/49'/1'/0'/0/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Testnet',
            path: [2147483697, 2147483649, 2147483648, 0, 0],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Testnet',
            path: "m/49'/2'/0'/0/0",
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedGetAddressResponse> = [
        {
            payload: {
                address: '2N4dH9yn4eYnnjHTYpN9xDmuMRS2k1AHWd8',
            },
        },
        {
            payload: {
                address: '2N4dH9yn4eYnnjHTYpN9xDmuMRS2k1AHWd8',
            },
        },
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/testnet',
    };
};

const bch = (): SubtestGetAddress => {
    const testPayloads: Array<TestGetAddressPayload> = [
        {
            method: 'getAddress',
            coin: 'Bcash',
            path: "m/44'/145'/0'/0/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bcash',
            path: [2147483692, 2147483793, 2147483648, 0, 0],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bcash',
            path: "44'/1'/0'/0/0",
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedGetAddressResponse> = [
        {
            payload: {
                address: 'bitcoincash:qzqxk2q6rhy3j9fnnc00m08g4n5dm827xv2dmtjzzp',
            },
        },
        {
            payload: {
                address: 'bitcoincash:qzqxk2q6rhy3j9fnnc00m08g4n5dm827xv2dmtjzzp',
            },
        },
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/bch',
    };
};

export const getAddress = (): TestFunction => {
    const availableSubtests = {
        btc,
        ltc,
        tbtc,
        bch,
    };
    const testName = 'GetAddress';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
