/* @flow */
import type {
    TestFunction,
} from 'flowtype/tests';

import type {
    TestEosGetPublicKeyPayload,
    ExpectedEosGetPublicKeyResponse,
} from 'flowtype/tests/eos-get-public-key';

// test vectors:
// https://github.com/trezor/trezor-firmware/blob/master/core/tests/test_apps.eos.get_public_key.py

export const eosGetPublicKey = (): TestFunction => {
    const testPayloads: Array<TestEosGetPublicKeyPayload> = [
        {
            method: 'eosGetPublicKey',
            path: "m/44'/194'/0'/0/0",
        },
        {
            method: 'eosGetPublicKey',
            path: [2147483692, 2147483842, 2147483648, 0, 1],
        },
        {
            method: 'eosGetPublicKey',
            path: "m/44'/194'",
        },
        {
            method: 'eosGetPublicKey',
            path: "m/44'/194'/0'/0/0'",
        },
        {
            method: 'eosGetPublicKey',
            path: [-1],
        },
        {
            method: 'eosGetPublicKey',
            bundle: [
                { path: "m/44'/194'/0'/0/0" },
                { path: "m/44'/194'/0'/0/1" },
                { path: "m/44'/194'/0'/0/0'" },
            ],
        },
    ];
    const expectedResponses: Array<ExpectedEosGetPublicKeyResponse> = [
        {
            payload: {
                wifPublicKey: 'EOS6zpSNY1YoLxNt2VsvJjoDfBueU6xC1M1ERJw1UoekL1NHn8KNA',
                rawPublicKey: '0315c358024ce46767102578947584c4342a6982b922d454f63588effa34597197',
            },
        },
        {
            payload: {
                wifPublicKey: 'EOS62cPUiWnLqbUjiBMxbEU4pm4Hp5X3RGk4KMTadvZNygjX72yHW',
                rawPublicKey: '029622eff7248c4d298fe28f2df19ee0d5f7674f678844e05c31d1a5632412869e',
            },
        },
        { success: false },
        {
            payload: {
                wifPublicKey: 'EOS7n7TXwR4Y3DtPt2ji6akhQi5uw4SruuPArvoNJso84vhwPQt1G',
                rawPublicKey: '037c9b7d24d42589941cca3f4debc75b37c0e7b881e6eb00d2e674958debe3bbc3',
            },
        },
        { success: false },
        {
            payload: [
                {
                    wifPublicKey: 'EOS6zpSNY1YoLxNt2VsvJjoDfBueU6xC1M1ERJw1UoekL1NHn8KNA',
                    rawPublicKey: '0315c358024ce46767102578947584c4342a6982b922d454f63588effa34597197',
                },
                {
                    wifPublicKey: 'EOS62cPUiWnLqbUjiBMxbEU4pm4Hp5X3RGk4KMTadvZNygjX72yHW',
                    rawPublicKey: '029622eff7248c4d298fe28f2df19ee0d5f7674f678844e05c31d1a5632412869e',
                },
                {
                    wifPublicKey: 'EOS7n7TXwR4Y3DtPt2ji6akhQi5uw4SruuPArvoNJso84vhwPQt1G',
                    rawPublicKey: '037c9b7d24d42589941cca3f4debc75b37c0e7b881e6eb00d2e674958debe3bbc3',
                },
            ],
        },
    ];
    const testName = 'EosGetPublicKey';

    return {
        testName,
        testPayloads,
        expectedResponses,
        mnemonic: 'mnemonic_abandon',
    };
};
