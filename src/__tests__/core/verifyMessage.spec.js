import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

const verifySubtest = (): void => {
    const testPayloads = [
        {
            // uncompressed pubkey - ok
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
            signature: '1ba77e01a9e17ba158b962cfef5f13dfed676ffc2b4bada24e58f784458b52b97421470d001d53d5880cf5e10e76f02be3e80bf21e18398cbd41e8c3b4af74c8c2',
            message: 'This is an example of a signed message.',
        },
        {
            // wcompressed pubkey - rong sig
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
            signature: '1ba77e01a9e17ba158b962cfef5f13dfed676ffc2b4bada24e58f784458b52b97421470d001d53d5880cf5e10e76f02be3e80bf21e18398cbd41e8c3b4af74c800',
            message: 'This is an example of a signed message.',
        },
        {
            // compressed pubkey - wrong msg
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
            signature: '1ba77e01a9e17ba158b962cfef5f13dfed676ffc2b4bada24e58f784458b52b97421470d001d53d5880cf5e10e76f02be3e80bf21e18398cbd41e8c3b4af74c8c2',
            message: 'This is an example of a signed message!',
        },
        {
            // compressed pubkey - ok
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1C7zdTfnkzmr13HfA2vNm5SJYRK6nEKyq8',
            signature: '1f44e3e461f7ca9f57c472ce1a28214df1de1dadefb6551a32d1907b80c74d5a1fbfd6daaba12dd8cb06699ce3f6941fbe0f3957b5802d13076181046e741eaaaf',
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - wrong sig
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1C7zdTfnkzmr13HfA2vNm5SJYRK6nEKyq8',
            signature: '1f44e3e461f7ca9f57c472ce1a28214df1de1dadefb6551a32d1907b80c74d5a1fbfd6daaba12dd8cb06699ce3f6941fbe0f3957b5802d13076181046e741eaa00',
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - ok
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
            signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - wrong msg
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
            signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message!',
        },
    ];
    const expectedResponses = [
        { success: true },
        { success: false },
        { success: false },
        { success: true },
        { success: false },
        { success: true },
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verify'
    };
};

const verifyLongSubtest = (): void => {
    const testPayloads = [
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
            signature: '205ff795c29aef7538f8b3bdb2e8add0d0722ad630a140b6aefd504a5a895cbd867cbb00981afc50edd0398211e8d7c304bb8efa461181bc0afa67ea4a720a89ed',
            message: 'VeryLongMessage!'.repeat(64),
        },
    ];
    const expectedResponses = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyLong'
    };
};

const verifyTestnetSubtest = (): void => {
    const testPayloads = [
        {
            method: 'verifyMessage',
            coin: 'Testnet',
            address: 'mirio8q3gtv7fhdnmb3TpZ4EuafdzSs7zL',
            signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyTestnet'
    };
};

const verifyBcashSubtest = (): void => {
    const testPayloads = [
        {
            method: 'verifyMessage',
            coin: 'Bcash',
            address: 'bitcoincash:qqj22md58nm09vpwsw82fyletkxkq36zxyxh322pru',
            signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyBcash'
    };
};

const verifyBitcoindSubtest = (): void => {
    const testPayloads = [
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1KzXE97kV7DrpxCViCN3HbGbiKhzzPM7TQ',
            signature: '1cc694f0f23901dfe3603789142f36a3fc582d0d5c0ec7215cf2ccd641e4e37228504f3d4dc3eea28bbdbf5da27c49d4635c097004d9f228750ccd836a8e1460c0',
            message: '\u017elu\u0165ou\u010dk\xfd k\u016f\u0148 \xfap\u011bl \u010f\xe1belsk\xe9 \xf3dy',
        },
    ];
    const expectedResponses = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyBitcoind'
    };
};

const verifyUtfSubtest = (): void => {
    const testPayloads = [
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
            signature: '20d0ec02ed8da8df23e7fe9e680e7867cc290312fe1c970749d8306ddad1a1eda41c6a771b13d495dd225b13b0a9d0f915a984ee3d0703f92287bf8009fbb9f7d6',
            message: 'Pr\u030ci\u0301s\u030cerne\u030c z\u030clut\u030couc\u030cky\u0301 ku\u030an\u030c u\u0301pe\u030cl d\u030ca\u0301belske\u0301 o\u0301dy za\u0301ker\u030cny\u0301 uc\u030cen\u030c be\u030cz\u030ci\u0301 pode\u0301l zo\u0301ny u\u0301lu\u030a',
        },
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
            signature: '20d0ec02ed8da8df23e7fe9e680e7867cc290312fe1c970749d8306ddad1a1eda41c6a771b13d495dd225b13b0a9d0f915a984ee3d0703f92287bf8009fbb9f7d6',
            message: 'P\u0159\xed\u0161ern\u011b \u017elu\u0165ou\u010dk\xfd k\u016f\u0148 \xfap\u011bl \u010f\xe1belsk\xe9 \xf3dy z\xe1ke\u0159n\xfd u\u010de\u0148 b\u011b\u017e\xed pod\xe9l z\xf3ny \xfal\u016f',
        },
    ];
    const expectedResponses = [
        { success: true },
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyUtf'
    };
};

export const verifyMessageTests = (): void => {
    const subtest = __karma__.config.subtest;
    const availableSubtests = {
        verify: verifySubtest,
        verifyLong: verifyLongSubtest,
        verifyTestnet: verifyTestnetSubtest,
        verifyBcash: verifyBcashSubtest,
        verifyBitcoind: verifyBitcoindSubtest,
        verifyUtf: verifyUtfSubtest
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