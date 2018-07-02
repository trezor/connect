/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { getHDPath } from '../../js/utils/pathUtils.js';

import type {
    SubtestGetAddress,
    GetAddressSegwitAvailableSubtests,
} from 'flowtype/tests';
import type {
    TestGetAddressPayload,
    ExpectedGetAddressResponse,
} from 'flowtype/tests/get-address';

const showSegwit = (): SubtestGetAddress => {
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
            path: "m/49'/0'/0'/0/1",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'/1/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'/1/1",
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
                address: '3CBs2AG2se3c3DxASUfgZE3PPwpMW1JhYp',
            },
        },
        {
            payload: {
                address: '3DDuECA7AomS7GSf5G2NAF6djKEqF2qma5',
            },
        },
        {
            payload: {
                address: '33Levhyt79XBK68BwyK61y5F1tE2ia7nZR',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/showSegwit',
    };
};

// TODO: test_show_multisig_3, required specified multisig in GetAddress method
/* const showMultisig3 = (): SubtestGetAddress => {
    const testPayloads: Array<TestGetAddressPayload> = [
        {
            method: 'signTransaction',
            coin: 'Testnet',
            inputs: [
                {
                    address_n: getHDPath("999'/1'/1'/2/0"),
                    prev_hash: 'f68caf10df12d5b07a34601d88fa6856c6edcbf4d05ebef3486510ae1c293d5f',
                    prev_index: 1,
                    script_type: 'SPENDMULTISIG',
                    amount: 24000,
                    multisig: {
                        pubkeys: [
                            {
                                node: 'xpub6DFYZ2FZwJHL6vwJdzyXwgVK4wNLBcN56wTdLLt3CCVhpZTcUMfuTg5TpUzsAKcEdXsyks9JfkgPH7Wg5gLrpeQXiJtSeMyyX68hkYoW1tj',
                                address_n: [1, 0],
                            },
                            {
                                node: 'xpub6DFYZ2FZwJHL81KQ3GTCFgzpyKijch3dfQ1hH6pSGWV6knjBaCQE2KCVHKnP95V8d9o6JhZw9LTBd6BKogxeFuHuzaTSLC7krAzsKhL8VmF',
                                address_n: [1, 0],
                            },
                            {
                                node: 'xpub6DFYZ2FZwJHLCH9ZDt7JTpuvm2o44BqNwa3zN7Rdk79FT91mm5Q8oyo5y6JLUptuBtQFMqSMeFVpLbe15X8sJwHCfQmkKQPpFdR4VN49Rzx',
                                address_n: [1, 0],
                            },
                        ],
                        signatures: [
                            '',
                            '304402207274b5a4d15e75f3df7319a375557b0efba9b27bc63f9f183a17da95a6125c94022000efac57629f1522e2d3958430e2ef073b0706cfac06cce492651b79858f09ae',
                            '',
                        ],
                        m: 2,
                    },
                },
            ],
            outputs: [
                {
                    address_n: getHDPath("44'/145'/1'/1/1"),
                    amount: 23000,
                    script_type: 'PAYTOMULTISIG',
                },
            ],
        },
    ];
    const expectedResponses: Array<ExpectedGetAddressResponse> = [

    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/showMultisig3',
    };
} */

export const getAddressSegwit = (): void => {
    const subtest: GetAddressSegwitAvailableSubtests = __karma__.config.subtest;
    const availableSubtests = {
        showSegwit,
        /* showMultisig3, */
    };

    describe('GetAddressSegwit', () => {
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

            it(`for derivation path: "[${payload.path.toString()}]"`, async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
};
