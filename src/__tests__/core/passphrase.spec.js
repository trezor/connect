/* @flow */
/* eslint-disable */


import type {
    SubtestPassphrase,
    TestFunction,
} from 'flowtype/tests';
import type {
    TestPassphrasePayload,
    ExpectedPassphraseResponse,
} from 'flowtype/tests/passphrase';

const correctPassphrase = (): SubtestPassphrase => {
    let testPayloads: Array<TestPassphrasePayload> = [
        {
            method: 'getPublicKey',
            coin: 'btc',
            path: "m/49'/0'/0'",
            passphrase: 'A',
            state: '9f0334bd78e441f1fa725f249a57a0a56050b9f479c94b5a829d4d70de34a37c9dcec089d6e70929686e584010a40dba74d7e6ddcd43054ac290b43c49c3a2c6'
        },
    ];

    let expectedResponses: Array<ExpectedPassphraseResponse> = [
        {
            payload: {
                xpub: 'xpub661MyMwAqRbcGSFnGhvj2yEs3HapBbJExFT7GRG4V83a8ECibmzmJHBaJrdTvQKhgaPxC1A53M7NLKCKG6uF9RYairavkNeXXarGLY68EZ9',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/correct',
    };
};

const wrongPassphrase = (): SubtestPassphrase => {
    let testPayloads: Array<TestPassphrasePayload> = [
        {
            method: 'getPublicKey',
            coin: 'btc',
            path: "m/49'/0'/0'",
            passphrase: 'A',
            // Wrong state for the given passphrase
            state: '1f0334bd78e441f1fa725f249a57a0a56050b9f479c94b5a829d4d70de34a37c9dcec089d6e70929686e584010a40dba74d7e6ddcd43054ac290b43c49c3a2c6'
        },
    ];

    let expectedResponses: Array<ExpectedPassphraseResponse> = [
        {
            success: false
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/wrong',
    };
};

/* const contexts = () => {

}; */

export const passphrase = (): TestFunction => {
    const availableSubtests = {
        correctPassphrase,
        wrongPassphrase,
        /* contexts, */
    }
    const testName = 'Passphrase';
    return {
        testName,
        subtests: {
            ...availableSubtests,
        },
    };
};