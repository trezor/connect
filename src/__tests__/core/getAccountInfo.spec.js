/* @flow */
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { getHDPath } from '../../js/utils/pathUtils.js';

import type {
    SubtestGetAccountInfo,
    GetAccountInfoAvailableSubtests,
} from 'flowtype/tests'
import type {
    TestGetAccountInfoPayload,
    ExpectedGetAccountInfoResponse,
} from 'flowtype/tests/get-account-info';

// Path specifies a first account (no address index)
// Should return a xpub for the first account
const firstAccount = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            path: getHDPath("m/49'/0'/0'"),
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                xpub: 'ypub6XKbB5DSkq8Royg8isNtGktj6bmEfGJXDs83Ad5CZ5tpDV8QofwSWQFTWP2Pv24vNdrPhquehL7vRMvSTj2GpKv6UaTQCBKZALm6RJAmxG6',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/btcSegwitFirstAccount',
    };
};

// Path specifies a zero balance address
// Should return a fresh address
const zeroBalance = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            path: getHDPath("m/49'/0'/0'/0/46"),
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                address: '3DDEgt7quAq7XqoG6PjVXi1eeAea4rfWck',
                addressPath: [2147483697, 2147483648, 2147483648, 0, 56],
                balance: 0,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/btcSegwitZeroBalance',
    };
};

// Path specifies an address with non-zero balance
// Should return an account with non-zero balance
// TODO?
const nonZeroBalance = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Testnet',
            path: getHDPath("m/49'/1'/0'/0/30"),
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                balance: 662277372,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/testnetNonZeroBalance',
    };
};

// Specifies an xpub instead of a path
// Should get same response as with the path
const xpubInsteadOfPath = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            xpub: 'ypub6XKbB5DSkq8Royg8isNtGktj6bmEfGJXDs83Ad5CZ5tpDV8QofwSWQFTWP2Pv24vNdrPhquehL7vRMvSTj2GpKv6UaTQCBKZALm6RJAmxG6',
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                address: '3DDEgt7quAq7XqoG6PjVXi1eeAea4rfWck',
                addressPath: [2147483697, 2147483648, 2147483648, 0, 56],
                balance: 0,
                xpub: 'ypub6XKbB5DSkq8Royg8isNtGktj6bmEfGJXDs83Ad5CZ5tpDV8QofwSWQFTWP2Pv24vNdrPhquehL7vRMvSTj2GpKv6UaTQCBKZALm6RJAmxG6',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/xpubInsteadOfPath',
    };
}

// Path is invalid
// Should fail
const pathInvalid = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            path: getHDPath("m/49'/0'"),
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/pathInvalid',
    };
};

// Path is specified without an address index
// Should return a fresh address
const noAddressIndex = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            path: getHDPath("m/49'/0'/0'"),
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                address: '3DDEgt7quAq7XqoG6PjVXi1eeAea4rfWck',
                addressPath: [2147483697, 2147483648, 2147483648, 0, 56],
                balance: 0,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/noAddressIndex',
    };
};

export const getAccountInfo = (): void => {
    const subtest: GetAccountInfoAvailableSubtests = __karma__.config.subtest;
    const availableSubtests = {
        firstAccount,
        zeroBalance,
        pathInvalid,
        noAddressIndex,
        nonZeroBalance,
        xpubInsteadOfPath,
    };

    describe('GetAccountInfo', () => {
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
