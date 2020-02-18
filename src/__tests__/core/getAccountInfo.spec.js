/* @flow */
import type { GetAccountInfo } from '../../js/types';

// Path specifies a first account (no address index)
// Should return a xpub for the first account
const firstSegwitAccount = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'",
        },
    ];
    const expectedResponses = [
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

const firstLegacyAccount = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            path: "m/44'/0'/0'",
        },
    ];
    const expectedResponses = [
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
const emptyAccount = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'Testnet',
            path: "m/49'/1'/256'",
        },
    ];
    const expectedResponses = [
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
const segwitAccountFromDescriptor = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            descriptor: 'ypub6Y5EDdQK9nQzpNeMtgXxhBB3SoLk2SyR2MFLQYsBkAusAHpaQNxTTwefgnL9G3oFGrRS9VkVvyY1SaApFAzQPZ99wto5etdReeE3XFkkMZt',
        },
    ];
    const expectedResponses = [
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

const legacyAccountFromDescriptor = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            descriptor: 'xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G',
        },
    ];
    const expectedResponses = [
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

const ethereumAccount = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'eth',
            path: "m/44'/60'/0'/0/0",
        },
    ];
    const expectedResponses = [
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

const ethereumAccountFromDescriptor = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'eth',
            descriptor: '0x3f2329C9ADFbcCd9A84f52c906E936A42dA18CB8',
        },
    ];
    const expectedResponses = [
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

const rippleAccount = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'xrp',
            path: "m/44'/144'/0'/0/0",
        },
    ];
    const expectedResponses = [
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

const rippleAccountFromDescriptor = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'xrp',
            descriptor: 'rfkV3EoXimH6JrG1QAyofgbVhnyZZDjWSj',
        },
    ];
    const expectedResponses = [
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
const invalidPath = () => {
    const testPayloads: GetAccountInfo[] = [
        {
            method: 'getAccountInfo',
            coin: 'Bitcoin',
            path: "m/49'/0'",
        },
    ];
    const expectedResponses = [
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/invalidPath',
    };
};

export const getAccountInfo = () => {
    return {
        testName: 'GetAccountInfo',
        mnemonic: 'mnemonic_12',
        subtests: {
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
        },
    };
};
