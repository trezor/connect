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
            path: "m/49'/0'/0'",
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                xpub: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
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
            coin: 'Testnet',
            path: "m/49'/1'/0'/0/2",
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                address: '2N75WGxdXfLY3kpToz1REMRB6Ga8Yam6i58',
                addressPath: [2147483697, 2147483649, 2147483648, 0, 1],
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/btcSegwitZeroBalance',
    };
};

// Specifies an xpub instead of a path
// Should get same response as with the path
const xpubInsteadOfPath = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            xpub: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                address: '3AnYTd2FGxJLNKL1AzxfW3FJMntp9D2KKX',
                addressPath: [2147483697, 2147483648, 2147483648],
                xpub: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
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
            path: "m/49'/0'",
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


export const getAccountInfo = (): void => {
    const subtest: GetAccountInfoAvailableSubtests = __karma__.config.subtest;
    const availableSubtests = {
        firstAccount,
        zeroBalance,
        pathInvalid,
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
