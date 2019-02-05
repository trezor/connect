/* @flow */
import type {
    TestFunction,
    SubtestSignMessage,
} from 'flowtype/tests';
import type {
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

    const signature = '209e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80';
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
                signature: signatureBuffer.toString('base64'),
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
            path: "m/49'/1'/0'",
            message: 'This is an example of a signed message.',
        },
    ];

    const signature = '23fbc8e26c957149bcb884edd531cab9182bf79b52235c2f7a3b69ffe751ee92be22219ff576ca00406e3717dc97f3917a2ad633bfd8f088dfc8b9abd0a3311556';
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: '2MtXohfW9QA4VhD1zxViEt7ETNc2NuTDPVA',
                signature: signatureBuffer.toString('base64'),
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
            path: "m/44'/145'/0'",
            message: 'This is an example of a signed message.',
        },
    ];

    const signature = '206c6379b33a93d220c232bc8d5d0f9dab8e89e396ebd687a0c40657060b9d553e2397612ea1df6e8aa8ec04ec5e5496c408e282ffd05b42b21da37d819e3720da';
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: 'bitcoincash:qzhsxlrst79yl6cn9fxahfl6amjn95fufcvsuqscme',
                signature: signatureBuffer.toString('base64'),
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

    const signature = '205ff795c29aef7538f8b3bdb2e8add0d0722ad630a140b6aefd504a5a895cbd867cbb00981afc50edd0398211e8d7c304bb8efa461181bc0afa67ea4a720a89ed';
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedResponses: Array<ExpectedSignMessageResponse> = [
        {
            payload: {
                address: '14LmW5k4ssUrtbAB4255zdqv3b4w1TuX9e',
                signature: signatureBuffer.toString('base64'),
            },
        },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/long',
    };
};

export const signMessage = (): TestFunction => {
    const availableSubtests = {
        sign,
        signTestnet,
        signBch,
        signLong,
    };
    const testName = 'SignMessage';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
