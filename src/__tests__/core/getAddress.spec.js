/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { describe, beforeEach, afterEach, it, expect } from 'flowtype/jasmine';
import { __karma__ } from 'flowtype/karma';

import {
    type Subtest,
} from 'flowtype/tests';
import {
    type TestAddressPayload,
    type ExpectedAddressResponse,
} from 'flowtype/tests/get-address';

const btc = (): Subtest => {
    const testPayloads: Array<TestAddressPayload> = [
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: [],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: [1],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: [-9, 0],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bitcoin',
            path: [0, 9999999],
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedAddressResponse> = [
        {
            payload: {
                address: '1EfKbQupktEMXf4gujJ9kCFo83k1iMqwqK',
            },
        },
        {
            payload: {
                address: '1CK7SJdcb8z9HuvVft3D91HLpLC6KSsGb',
            },
        },
        {
            payload: {
                address: '1F4YdQdL9ZQwvcNTuy5mjyQxXkyCfMcP2P',
            },
        },
        {
            payload: {
                address: '1GS8X3yc7ntzwGw9vXwj9wqmBWZkTFewBV',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/btc',
    };
};

const ltc = (): Subtest => {
    const testPayloads: Array<TestAddressPayload> = [
        {
            method: 'getAddress',
            coin: 'Litecoin',
            path: [],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Litecoin',
            path: [1],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Litecoin',
            path: [-9, 0],
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Litecoin',
            path: [0, 9999999],
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedAddressResponse> = [
        {
            payload: {
                address: 'LYtGrdDeqYUQnTkr5sHT2DKZLG7Hqg7HTK',
            },
        },
        {
            payload: {
                address: 'LKRGNecThFP3Q6c5fosLVA53Z2hUDb1qnE',
            },
        },
        {
            payload: {
                address: 'LZHVtcwAEDf1BR4d67551zUijyLUpDF9EX',
            },
        },
        {
            payload: {
                address: 'Laf5nGHSCT94C5dK6fw2RxuXPiw2ZuRR9S',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/ltc',
    };
};

const tbtc = (): Subtest => {
    const testPayloads: Array<TestAddressPayload> = [
        {
            method: 'getAddress',
            coin: 'Testnet',
            path: [111, 42],
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedAddressResponse> = [
        {
            payload: {
                address: 'moN6aN6NP1KWgnPSqzrrRPvx2x1UtZJssa',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/testnet',
    };
};

const bch = (): Subtest => {
    const testPayloads: Array<TestAddressPayload> = [
        {
            method: 'getAddress',
            coin: 'Bcash',
            path: "44'/145'/0'/0/0",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bcash',
            path: "44'/145'/0'/0/1",
            showOnTrezor: true,
        },
        {
            method: 'getAddress',
            coin: 'Bcash',
            path: "44'/145'/0'/1/0",
            showOnTrezor: true,
        },
    ];

    const expectedResponses: Array<ExpectedAddressResponse> = [
        {
            payload: {
                address: 'bitcoincash:qr08q88p9etk89wgv05nwlrkm4l0urz4cyl36hh9sv',
            },
        },
        {
            payload: {
                address: 'bitcoincash:qr23ajjfd9wd73l87j642puf8cad20lfmqdgwvpat4',
            },
        },
        {
            payload: {
                address: 'bitcoincash:qzc5q87w069lzg7g3gzx0c8dz83mn7l02scej5aluw',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/bch',
    };
};

export const getAddress = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        btc,
        ltc,
        tbtc,
        bch,
    };

    describe('GetAddress', () => {
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
