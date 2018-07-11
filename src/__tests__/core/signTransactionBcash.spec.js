/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { getHDPath } from '../../js/utils/pathUtils.js';

import type {
    SubtestSignTransaction,
    SignTransactionBcashAvailableSubtests,
} from 'flowtype/tests';
import type {
    TestSignTransactionPayload,
    ExpectedSignTransactionResponse,
} from 'flowtype/tests/sign-transaction';

const change = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bcash',
            inputs: [
                {
                    address_n: getHDPath("44'/145'/0'/0/0"),
                    amount: 1995344,
                    prev_hash: 'bc37c28dfb467d2ecb50261387bf752a3977d7e5337915071bb4151e6b711a78',
                    prev_index: 0,
                    script_type: 'SPENDADDRESS',
                },
            ],

            outputs: [
                {
                    address_n: getHDPath("44'/145'/0'/1/0"),
                    amount: 1896050,
                    script_type: 'PAYTOADDRESS',
                },
                {
                    address: 'bitcoincash:qr23ajjfd9wd73l87j642puf8cad20lfmqdgwvpat4',
                    amount: 73452,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serialized: {
                    serialized_tx: '0100000001781a716b1e15b41b07157933e5d777392a75bf87132650cb2e7d46fb8dc237bc000000006a473044022061aee4f17abe044d5df8c52c9ffd3b84e5a29743517e488b20ecf1ae0b3e4d3a02206bb84c55e407f3b684ff8d9bea0a3409cfd865795a19d10b3d3c31f12795c34a412103a020b36130021a0f037c1d1a02042e325c0cb666d6478c1afdcd9d913b9ef080ffffffff0272ee1c00000000001976a914b1401fce7e8bf123c88a0467e0ed11e3b9fbef5488acec1e0100000000001976a914d51eca49695cdf47e7f4b55507893e3ad53fe9d888ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/change',
    };
};

const noChange = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bcash',
            inputs: [
                {
                    address_n: getHDPath("44'/145'/0'/1/0"),
                    amount: 1896050,
                    prev_hash: '502e8577b237b0152843a416f8f1ab0c63321b1be7a8cad7bf5c5c216fcf062c',
                    prev_index: 0,
                    script_type: 'SPENDADDRESS',
                },
                {
                    address_n: getHDPath("44'/145'/0'/0/1"),
                    amount: 73452,
                    prev_hash: '502e8577b237b0152843a416f8f1ab0c63321b1be7a8cad7bf5c5c216fcf062c',
                    prev_index: 1,
                    script_type: 'SPENDADDRESS',
                },
            ],

            outputs: [
                {
                    address: 'bitcoincash:qq6wnnkrz7ykaqvxrx4hmjvayvzjzml54uyk76arx4',
                    amount: 1934960,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000022c06cf6f215c5cbfd7caa8e71b1b32630cabf1f816a4432815b037b277852e50000000006a47304402207a2a955f1cb3dc5f03f2c82934f55654882af4e852e5159639f6349e9386ec4002205fb8419dce4e648eae8f67bc4e369adfb130a87d2ea2d668f8144213b12bb457412103174c61e9c5362507e8061e28d2c0ce3d4df4e73f3535ae0b12f37809e0f92d2dffffffff2c06cf6f215c5cbfd7caa8e71b1b32630cabf1f816a4432815b037b277852e50010000006a473044022062151cf960b71823bbe68c7ed2c2a93ad1b9706a30255fddb02fcbe056d8c26102207bad1f0872bc5f0cfaf22e45c925c35d6c1466e303163b75cb7688038f1a5541412102595caf9aeb6ffdd0e82b150739a83297358b9a77564de382671056ad9e5b8c58ffffffff0170861d00000000001976a91434e9cec317896e818619ab7dc99d2305216ff4af88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/noChange',
    };
};

const oldAddr = (): SubtestSignTransaction => {
    const testPayloads: Array<TestSignTransactionPayload> = [
        {
            method: 'signTransaction',
            coin: 'Bcash',
            inputs: [
                {
                    address_n: getHDPath("44'/145'/0'/1/0"),
                    amount: 1896050,
                    prev_hash: '502e8577b237b0152843a416f8f1ab0c63321b1be7a8cad7bf5c5c216fcf062c',
                    prev_index: 0,
                    script_type: 'SPENDADDRESS',
                },
                {
                    address_n: getHDPath("44'/145'/0'/0/1"),
                    amount: 73452,
                    prev_hash: '502e8577b237b0152843a416f8f1ab0c63321b1be7a8cad7bf5c5c216fcf062c',
                    prev_index: 1,
                    script_type: 'SPENDADDRESS',
                },
            ],

            outputs: [
                {
                    address: '15pnEDZJo3ycPUamqP3tEDnEju1oW5fBCz',
                    amount: 1934960,
                    script_type: 'PAYTOADDRESS',
                },
            ],
        },
    ];

    const expectedResponses: Array<ExpectedSignTransactionResponse> = [
        {
            payload: {
                serialized: {
                    serialized_tx: '01000000022c06cf6f215c5cbfd7caa8e71b1b32630cabf1f816a4432815b037b277852e50000000006a47304402207a2a955f1cb3dc5f03f2c82934f55654882af4e852e5159639f6349e9386ec4002205fb8419dce4e648eae8f67bc4e369adfb130a87d2ea2d668f8144213b12bb457412103174c61e9c5362507e8061e28d2c0ce3d4df4e73f3535ae0b12f37809e0f92d2dffffffff2c06cf6f215c5cbfd7caa8e71b1b32630cabf1f816a4432815b037b277852e50010000006a473044022062151cf960b71823bbe68c7ed2c2a93ad1b9706a30255fddb02fcbe056d8c26102207bad1f0872bc5f0cfaf22e45c925c35d6c1466e303163b75cb7688038f1a5541412102595caf9aeb6ffdd0e82b150739a83297358b9a77564de382671056ad9e5b8c58ffffffff0170861d00000000001976a91434e9cec317896e818619ab7dc99d2305216ff4af88ac00000000',
                },
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/oldAddr',
    };
};


export const signTransactionBcash = (): void => {
    const subtest: SignTransactionBcashAvailableSubtests = __karma__.config.subtest;
    const availableSubtests = {
        change,
        noChange,
        oldAddr,
    };

    describe('SignTransactionBCash', () => {
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
