/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import type {
    SubtestGetAddress,
    GetAddressAvailableSubtests,
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

export const getAddress = (): void => {
    const subtest: GetAddressAvailableSubtests = __karma__.config.subtest;
    const availableSubtests = {
        btc,
        ltc,
        tbtc,
        bch,
    };

    describe('GetAddress', () => {
        let core: Core;

        beforeEach(async (done) => {
            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        const { testPayloads, expectedResponses, specName } = availableSubtests[subtest]();
        if (testPayloads.length !== expectedResponses.length) {
            throw new Error('Different number of payloads and expected responses');
        }

        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];

            it(specName, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};
