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
            state: 'a3c4974ba31d3b7772ee6fbda5df12010c4ebafa94c9ec3d7b0ad50252ab42cdea9161152a5b12e344d98ed20e183baaac5c53af40778aad22376d013aca94a2'
        },
    ];

    let expectedResponses: Array<ExpectedPassphraseResponse> = [
        {
            payload: {
                xpub: 'xpub6Cpsx8nPk8iiTy3BMTB7Q2bNSfDr8FC1r6Qn2YcJnHmmx9dRAvNTFiiLabT99o86C97PRGFq8SMB85JKqR9w9CnRDJ35gDfwMLGQDSis6kL',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/correct',
    };
};

// const wrongPassphrase = (): SubtestPassphrase => {
//     let testPayloads: Array<TestPassphrasePayload> = [
//         {
//             method: 'getPublicKey',
//             coin: 'btc',
//             path: "m/49'/0'/0'",
//             passphrase: 'A',
//             // Wrong state for the given passphrase
//             state: '13c4974ba31d3b7772ee6fbda5df12010c4ebafa94c9ec3d7b0ad50252ab42cdea9161152a5b12e344d98ed20e183baaac5c53af40778aad22376d013aca94a2'
//         },
//     ];

//     let expectedResponses: Array<ExpectedPassphraseResponse> = [
//         {
//             success: false
//         },
//     ];

//     return {
//         testPayloads,
//         expectedResponses,
//         specName: '/wrong',
//     };
// };

/* const contexts = () => {

}; */

export const passphrase = (): TestFunction => {
    const availableSubtests = {
        correctPassphrase,
        // wrongPassphrase,
        /* contexts, */
    }
    const testName = 'Passphrase';
    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};