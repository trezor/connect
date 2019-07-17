/* @flow */
import type {
    TestFunction,
    SubtestGetAccountInfo,
} from 'flowtype/tests';
import type {
    TestGetAccountInfoPayload,
    ExpectedGetAccountInfoResponse,
} from 'flowtype/tests/get-account-info';

// Path specifies a first account (no address index)
// Should return a xpub for the first account
const firstSegwitAccount = (): SubtestGetAccountInfo => {
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
                descriptor: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/firstSegwitAccount',
    };
};

const firstLegacyAccount = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            path: "m/44'/0'/0'",
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                descriptor: 'xpub6D1weXBcFAo8CqBbpP4TbH5sxQH8ZkqC5pDEvJ95rNNBZC9zrKmZP2fXMuve7ZRBe18pWQQsGg68jkq24mZchHwYENd8cCiSb71u3KD4AFH',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/firstLegacyAccount',
    };
};

// Path specifies a zero balance address
// Should return a fresh address
const emptyAccount = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Testnet',
            path: "m/49'/1'/256'",
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                balance: '0',
                availableBalance: '0',
                empty: true,
                descriptor: 'upub5Eo1frmiD2QQL6L5x5toFyJVZQuFijQTwiDK7S7KDkgCNykDJtG4TApkdv23L5MDLgRuxMJQEucxXVio2ciKCqfx6Y41skKTZhxNjSgJ6pU',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/emptyAccount',
    };
};

// Specifies an xpub instead of a path
// Should get same response as with the path
const segwitAccountFromDescriptor = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            descriptor: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                empty: false,
                descriptor: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/segwitAccountFromDescriptor',
    };
};

const legacyAccountFromDescriptor = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            descriptor: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                descriptor: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/legacyAccountFromDescriptor',
    };
};

const ethereumAccount = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'eth',
            path: "m/44'/60'/0'/0/0",
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                descriptor: '0x3f2329C9ADFbcCd9A84f52c906E936A42dA18CB8',
                balance: '21000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/ethereumAccount',
    };
};

const ethereumAccountFromDescriptor = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'eth',
            descriptor: '0x3f2329C9ADFbcCd9A84f52c906E936A42dA18CB8',
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                descriptor: '0x3f2329C9ADFbcCd9A84f52c906E936A42dA18CB8',
                balance: '21000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/ethereumAccountFromDescriptor',
    };
};

const rippleAccount = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'xrp',
            path: "m/44'/144'/0'/0/0",
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                descriptor: 'rh5ZnEVySAy7oGd3nebT3wrohGDrsNS83E',
                empty: true,
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/rippleAccount',
    };
};

const rippleAccountFromDescriptor = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'xrp',
            descriptor: 'rfkV3EoXimH6JrG1QAyofgbVhnyZZDjWSj',
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                descriptor: 'rfkV3EoXimH6JrG1QAyofgbVhnyZZDjWSj',
                balance: '20000000',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/rippleAccountFromDescriptor',
    };
};

// Path is invalid
// Should fail
const invalidPath = (): SubtestGetAccountInfo => {
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
        specName: '/invalidPath',
    };
};

export const getAccountInfo = (): TestFunction => {
    const availableSubtests = {
        firstSegwitAccount,
        firstLegacyAccount,
        segwitAccountFromDescriptor,
        legacyAccountFromDescriptor,
        emptyAccount,
        invalidPath,
        ethereumAccount,
        ethereumAccountFromDescriptor,
        rippleAccount,
        rippleAccountFromDescriptor,
    };
    const testName = 'GetAccountInfo';
    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
