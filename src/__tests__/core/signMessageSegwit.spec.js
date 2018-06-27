/* @flow */

import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

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
            path: "m/49'/0'/0'",
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: '3Pm1J6dXuugmkTgM5PdidR9UssSWwdy5Vh',
                signature: '23d2cc1b2946f403b9acc71a70d3ab8d3ed7575a4d8fe91310ff2a7bb68246a81b77331e4245b9163a398925c78497c2daa3bbb482fc1a0b7c0255068e79f40a67',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/sign',
    };
};

const signLong = (): SubtestSignMessage => {
    const testPayloads = [
        {
            method: 'signMessage',
            coin: 'Bitcoin',
            path: "m/49'/0'/0'",
            message: 'VeryLongMessage!'.repeat(64),
        },
    ];
    const expectedResponses = [
        {
            payload: {
                address: '3Pm1J6dXuugmkTgM5PdidR9UssSWwdy5Vh',
                signature: '243e2ffc7736c4a49389696cd3a01c4543763a6fcef7a2f1a5a9ebc8fbba5c6f9a59928f3a611579e0b956dd6df3a6dc3815c81402f9f2e7cfe1ce53cac71a8786',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/signLong',
    };
};

export const signMessageSegwit = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        sign,
        signLong,
    };

    describe('SignMessageSegwit', () => {
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