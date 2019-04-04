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
                xpub: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
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
                xpub: 'xpub6D1weXBcFAo8CqBbpP4TbH5sxQH8ZkqC5pDEvJ95rNNBZC9zrKmZP2fXMuve7ZRBe18pWQQsGg68jkq24mZchHwYENd8cCiSb71u3KD4AFH',
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
                address: '2N4xuu4hZrLPbbCBZx2nr4A2CUdFauY2VDd',
                addressIndex: 0,
                addressPath: [2147483697, 2147483649, 2147483904, 0, 0],
                balance: '0',
                transactions: 0,
                utxo: [],
                usedAddresses: [],
                xpub: 'upub5Eo1frmiD2QQL6L5x5toFyJVZQuFijQTwiDK7S7KDkgCNykDJtG4TApkdv23L5MDLgRuxMJQEucxXVio2ciKCqfx6Y41skKTZhxNjSgJ6pU',
                xpubSegwit: 'upub5Eo1frmiD2QQL6L5x5toFyJVZQuFijQTwiDK7S7KDkgCNykDJtG4TApkdv23L5MDLgRuxMJQEucxXVio2ciKCqfx6Y41skKTZhxNjSgJ6pU',
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
const segwitAccountFromSegwitXpub = (): SubtestGetAccountInfo => {
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
                xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
                xpubSegwit: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/segwitAccountFromSegwitXpub',
    };
};

const segwitAccountFromLegacyXpub = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
                xpubSegwit: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/segwitAccountFromSegwitXpub',
    };
};

const legacyAccountFromLegacyXpub = (): SubtestGetAccountInfo => {
    const testPayloads: Array<TestGetAccountInfoPayload> = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
        },
    ];
    const expectedResponses: Array<ExpectedGetAccountInfoResponse> = [
        {
            payload: {
                xpub: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/segwitAccountFromSegwitXpub',
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
        segwitAccountFromSegwitXpub,
        segwitAccountFromLegacyXpub,
        legacyAccountFromLegacyXpub,
        emptyAccount,
        invalidPath,
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
