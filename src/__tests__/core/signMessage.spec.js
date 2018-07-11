/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

import { describe, beforeEach, afterEach, it, expect } from 'flowtype/jasmine';
import { __karma__ } from 'flowtype/karma';

import type {
    SubtestSignMessage,
    TestSignMessagePayload,
    ExpectedSignMessageResponse,
} from 'flowtype/tests/sign-message';

const sign = (): SubtestSignMessage => {
    const testPayloads: Array<TestSignMessagePayload> = [
        {
            method: 'signMessage',
            coin: 'Bitcoin',
            path: [0],
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
                signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sign',
    };
};

const signTestnet = (): SubtestSignMessage => {
    const testPayloads: Array<TestSignMessagePayload> = [
        {
            method: 'signMessage',
            coin: 'Testnet',
            path: [0],
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: 'mirio8q3gtv7fhdnmb3TpZ4EuafdzSs7zL',
                signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/testnet',
    };
};

const signBch = (): SubtestSignMessage => {
    const testPayloads: Array<TestSignMessagePayload> = [
        {
            method: 'signMessage',
            coin: 'Bcash',
            path: [0],
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: 'bitcoincash:qqj22md58nm09vpwsw82fyletkxkq36zxyxh322pru',
                signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/bch',
    };
};

const signLong = (): SubtestSignMessage => {
    const testPayloads: Array<TestSignMessagePayload> = [
        {
            method: 'signMessage',
            coin: 'Bitcoin',
            path: [0],
            message: 'VeryLongMessage!'.repeat(64),
        },
    ];
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
                signature: '205ff795c29aef7538f8b3bdb2e8add0d0722ad630a140b6aefd504a5a895cbd867cbb00981afc50edd0398211e8d7c304bb8efa461181bc0afa67ea4a720a89ed',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/long',
    };
};

export const signMessage = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        sign,
        signTestnet,
        signBch,
        signLong,
    };

    describe('SignMessage', () => {
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