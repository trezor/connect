import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

const signSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signMessage',
            coin: 'Bitcoin',
            path: [0],
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses = [
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

const signTestnetSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signMessage',
            coin: 'Testnet',
            path: [0],
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses = [
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

const signBchSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signMessage',
            coin: 'Bcash',
            path: [0],
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses = [
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

const signLongSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signMessage',
            coin: 'Bitcoin',
            path: [0],
            message: 'VeryLongMessage!'.repeat(64),
        },
    ];
    const expectedResponses = [
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

const signUtfSubtest = (): void => {
    const testPayloads = [
        {
            method: 'signMessage',
            coin: 'Bitcoin',
            path: [0],
            message: 'Pr\u030ci\u0301s\u030cerne\u030c z\u030clut\u030couc\u030cky\u0301 ku\u030an\u030c u\u0301pe\u030cl d\u030ca\u0301belske\u0301 o\u0301dy za\u0301ker\u030cny\u0301 uc\u030cen\u030c be\u030cz\u030ci\u0301 pode\u0301l zo\u0301ny u\u0301lu\u030a',
        },
        {
            method: 'signMessage',
            coin: 'Bitcoin',
            path: [0],
            message: 'P\u0159\xed\u0161ern\u011b \u017elu\u0165ou\u010dk\xfd k\u016f\u0148 \xfap\u011bl \u010f\xe1belsk\xe9 \xf3dy z\xe1ke\u0159n\xfd u\u010de\u0148 b\u011b\u017e\xed pod\xe9l z\xf3ny \xfal\u016f',
        },
    ];
    const expectedResponses = [
        {
            payload: {
                address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
                signature: '20d0ec02ed8da8df23e7fe9e680e7867cc290312fe1c970749d8306ddad1a1eda41c6a771b13d495dd225b13b0a9d0f915a984ee3d0703f92287bf8009fbb9f7d6',
            },
        },
        {
            payload: {
                address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
                signature: '20d0ec02ed8da8df23e7fe9e680e7867cc290312fe1c970749d8306ddad1a1eda41c6a771b13d495dd225b13b0a9d0f915a984ee3d0703f92287bf8009fbb9f7d6',
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/utf',
    };
};

export const signMessageTests = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        sign: signSubtest,
        signTestnet: signTestnetSubtest,
        signBch: signBchSubtest,
        signLong: signLongSubtest,
        signUtf: signUtfSubtest,
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