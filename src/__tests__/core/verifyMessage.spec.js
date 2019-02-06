/* @flow */
import type {
    TestFunction,
    SubtestVerifyMessage,
} from 'flowtype/tests';
import type {
    TestVerifyMessagePayload,
    ExpectedVerifyMessageResponse,
} from 'flowtype/tests/verify-message';

const verify = (): SubtestVerifyMessage => {
    const testPayloads: Array<TestVerifyMessagePayload> = [
        {
            // uncompressed pubkey - ok
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
            signature: /* btoa( */'1ba77e01a9e17ba158b962cfef5f13dfed676ffc2b4bada24e58f784458b52b97421470d001d53d5880cf5e10e76f02be3e80bf21e18398cbd41e8c3b4af74c8c2'/* ) */,
            message: 'This is an example of a signed message.',
        },
        {
            // compressed pubkey - wrong sig
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
            signature: /* btoa( */'1ba77e01a9e17ba158b962cfef5f13dfed676ffc2b4bada24e58f784458b52b97421470d001d53d5880cf5e10e76f02be3e80bf21e18398cbd41e8c3b4af74c800'/* ) */,
            message: 'This is an example of a signed message.',
        },
        {
            // compressed pubkey - wrong msg
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1JwSSubhmg6iPtRjtyqhUYYH7bZg3Lfy1T',
            signature: /* btoa( */'1ba77e01a9e17ba158b962cfef5f13dfed676ffc2b4bada24e58f784458b52b97421470d001d53d5880cf5e10e76f02be3e80bf21e18398cbd41e8c3b4af74c8c2'/* ) */,
            message: 'This is an example of a signed message!',
        },
        {
            // compressed pubkey - ok
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1C7zdTfnkzmr13HfA2vNm5SJYRK6nEKyq8',
            signature: /* btoa( */'1f44e3e461f7ca9f57c472ce1a28214df1de1dadefb6551a32d1907b80c74d5a1fbfd6daaba12dd8cb06699ce3f6941fbe0f3957b5802d13076181046e741eaaaf'/* ) */,
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - wrong sig
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1C7zdTfnkzmr13HfA2vNm5SJYRK6nEKyq8',
            signature: /* btoa( */'1f44e3e461f7ca9f57c472ce1a28214df1de1dadefb6551a32d1907b80c74d5a1fbfd6daaba12dd8cb06699ce3f6941fbe0f3957b5802d13076181046e741eaa00'/* ) */,
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - ok
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
            signature: /* btoa( */'209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80'/* ) */,
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - wrong msg
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
            signature: /* btoa( */'209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80'/* ) */,
            message: 'This is an example of a signed message!',
        },
    ];
    const expectedResponses: Array<ExpectedVerifyMessageResponse> = [
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
        specName: '/verify',
    };
};

const verifyLong = (): SubtestVerifyMessage => {
    const testPayloads: Array<TestVerifyMessagePayload> = [
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
            signature: '205ff795c29aef7538f8b3bdb2e8add0d0722ad630a140b6aefd504a5a895cbd867cbb00981afc50edd0398211e8d7c304bb8efa461181bc0afa67ea4a720a89ed',
            message: 'VeryLongMessage!'.repeat(64),
        },
    ];
    const expectedResponses: Array<ExpectedVerifyMessageResponse> = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyLong',
    };
};

const verifyTestnet = (): SubtestVerifyMessage => {
    const testPayloads: Array<TestVerifyMessagePayload> = [
        {
            method: 'verifyMessage',
            coin: 'Testnet',
            address: 'mirio8q3gtv7fhdnmb3TpZ4EuafdzSs7zL',
            signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses: Array<ExpectedVerifyMessageResponse> = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyTestnet',
    };
};

const verifyBcash = (): SubtestVerifyMessage => {
    const testPayloads: Array<TestVerifyMessagePayload> = [
        {
            method: 'verifyMessage',
            coin: 'Bcash',
            address: 'bitcoincash:qqj22md58nm09vpwsw82fyletkxkq36zxyxh322pru',
            signature: '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80',
            message: 'This is an example of a signed message.',
        },
    ];
    const expectedResponses: Array<ExpectedVerifyMessageResponse> = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyBcash',
    };
};

const verifyBitcoind = (): SubtestVerifyMessage => {
    const testPayloads: Array<TestVerifyMessagePayload> = [
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '1KzXE97kV7DrpxCViCN3HbGbiKhzzPM7TQ',
            signature: '1cc694f0f23901dfe3603789142f36a3fc582d0d5c0ec7215cf2ccd641e4e37228504f3d4dc3eea28bbdbf5da27c49d4635c097004d9f228750ccd836a8e1460c0',
            message: 'žluťoučký kůň úpěl ďábelské ódy',
        },
    ];
    const expectedResponses: Array<ExpectedVerifyMessageResponse> = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyBitcoind',
    };
};

export const verifyMessage = (): TestFunction => {
    const availableSubtests = {
        verify,
        verifyLong,
        verifyTestnet,
        verifyBcash,
        verifyBitcoind,
    };
    const testName = 'VerifyMessage';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
