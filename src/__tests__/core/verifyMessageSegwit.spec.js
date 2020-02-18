/* @flow */
import type { VerifyMessage } from '../../js/types';

const verify = () => {
    const testPayloads: VerifyMessage[] = [
        {
            // trezor pubkey - OK
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: Buffer.from('249e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80', 'hex').toString('base64'),
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - wrong sig
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: Buffer.from('249e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be00', 'hex').toString('base64'),
            message: 'This is an example of a signed message.',
        },
        {
            // trezor pubkey - wrong msg
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: Buffer.from('249e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80', 'hex').toString('base64'),
            message: 'This is an example of a signed message!',
        },
    ];

    const expectedResponses = [
        { success: true },
        { success: false },
        { success: false },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verify',
    };
};

const verifyLong = () => {
    const testPayloads: VerifyMessage[] = [
        {
            method: 'verifyMessage',
            coin: 'Bitcoin',
            address: '3CwYaeWxhpXXiHue3ciQez1DLaTEAXcKa1',
            signature: Buffer.from('245ff795c29aef7538f8b3bdb2e8add0d0722ad630a140b6aefd504a5a895cbd867cbb00981afc50edd0398211e8d7c304bb8efa461181bc0afa67ea4a720a89ed', 'hex').toString('base64'),
            message: 'VeryLongMessage!'.repeat(64),
        },
    ];

    const expectedResponses = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyLong',
    };
};

const verifyTestnet = () => {
    const testPayloads: VerifyMessage[] = [
        {
            method: 'verifyMessage',
            coin: 'Testnet',
            address: '2N4VkePSzKH2sv5YBikLHGvzUYvfPxV6zS9',
            signature: Buffer.from('249e23edf0e4e47ff1dec27f32cd78c50e74ef018ee8a6adf35ae17c7a9b0dd96f48b493fd7dbab03efb6f439c6383c9523b3bbc5f1a7d158a6af90ab154e9be80', 'hex').toString('base64'),
            message: 'This is an example of a signed message.',
        },
    ];

    const expectedResponses = [
        { success: true },
    ];

    return {
        testPayloads,
        expectedResponses,
        specName: '/verifyTestnet',
    };
};

export const verifyMessageSegwit = () => {
    const availableSubtests = {
        verify,
        verifyLong,
        verifyTestnet,
    };
    const testName = 'VerifyMessageSegwit';

    return {
        testName,
        mnemonic: 'mnemonic_12',
        subtests: {
            ...availableSubtests,
        },
    };
};
