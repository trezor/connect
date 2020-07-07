/* @flow */
import type { CardanoGetAddress } from '../../js/types';

// vectors from https://github.com/trezor/trezor-firmware/tree/master/python/trezorlib/tests/device_tests/test_msg_cardano_get_address.py

const PROTOCOL_MAGICS = {
    mainnet: 0,
    testnet: 42,
};

const getAddressMainnet = () => {
    const testPayloads: CardanoGetAddress[] = [
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/0",
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            path: [2147483697],
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/1",
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/2",
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                address: 'Ae2tdPwUPEZLCq3sFv4wVYxwqjMH2nUzBVt1HFr4v87snYrtYq3d3bq2PUQ',
            },
        },
        { success: false },
        {
            payload: {
                address: 'Ae2tdPwUPEZEY6pVJoyuNNdLp7VbMB7U7qfebeJ7XGunk5Z2eHarkcN1bHK',
            },
        },
        {
            payload: {
                address: 'Ae2tdPwUPEZ3gZD1QeUHvAqadAV59Zid6NP9VCR9BG5LLAja9YtBUgr6ttK',
            },
        },
    ];

    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};

const getAddressTestnet = () => {
    const testPayloads: CardanoGetAddress[] = [
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/0",
            protocolMagic: PROTOCOL_MAGICS['testnet'],
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/1",
            protocolMagic: PROTOCOL_MAGICS['testnet'],
        },
        {
            method: 'cardanoGetAddress',
            path: "m/44'/1815'/0'/0/2",
            protocolMagic: PROTOCOL_MAGICS['testnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                address: '2657WMsDfac5UggijVFxgu3hEYKAPBhwQsk2HoPAafMXkgZ6uaPgDmiJeubghAQVe',
            },
        },
        {
            payload: {
                address: '2657WMsDfac63WQoMHafvPofvN3dKV3EpyabFanTRekzpBJo9dcFpYBkjGeFyUQzf',
            },
        },
        {
            payload: {
                address: '2657WMsDfac7RgcCQASPeUNUSGkXkaHicG5H7WZTQRSWRdsdC83RcNy24fKWSK3NL',
            },
        },
    ];

    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_12',
        testPayloads,
        expectedResponses,
    };
};

export const cardanoGetAddress = () => {
    const availableSubtests = {
        getAddressMainnet,
        getAddressTestnet,
    };
    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_all',
        subtests: {
            ...availableSubtests,
        },
    };
};
