/* @flow */
import type { CardanoGetAddress } from '../../js/types';
import { CARDANO_ADDRESS_TYPE } from '../../js/types';

// vectors from https://github.com/trezor/trezor-firmware/tree/master/python/trezorlib/tests/device_tests/test_msg_cardano_get_address.py

const PROTOCOL_MAGICS = {
    mainnet: 0,
    testnet: 42,
};

const NETWORK_IDS = {
    mainnet: 1,
    testnet: 0,
};

const HARDENED = 0x80000000;

const getByronAddressMainnet = () => {
    const testPayloads: CardanoGetAddress[] = [
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Byron,
                path: "m/44'/1815'/0'/0/0",
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Byron,
                path: [HARDENED + 49],
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Byron,
                path: "m/44'/1815'/0'/0/1",
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Byron,
                path: "m/44'/1815'/0'/0/2",
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                address: 'Ae2tdPwUPEZ5YUb8sM3eS8JqKgrRLzhiu71crfuH2MFtqaYr5ACNRdsswsZ',
            },
        },
        { success: false },
        {
            payload: {
                address: 'Ae2tdPwUPEZJb8r1VZxweSwHDTYtqeYqF39rZmVbrNK62JHd4Wd7Ytsc8eG',
            },
        },
        {
            payload: {
                address: 'Ae2tdPwUPEZFm6Y7aPZGKMyMAK16yA5pWWKU9g73ncUQNZsAjzjhszenCsq',
            },
        },
    ];

    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_all',
        testPayloads,
        expectedResponses,
    };
};

const getByronAddressTestnet = () => {
    const testPayloads: CardanoGetAddress[] = [
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Byron,
                path: "m/44'/1815'/0'/0/0",
            },
            protocolMagic: PROTOCOL_MAGICS['testnet'],
            networkId: NETWORK_IDS['testnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Byron,
                path: "m/44'/1815'/0'/0/1",
            },
            protocolMagic: PROTOCOL_MAGICS['testnet'],
            networkId: NETWORK_IDS['testnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Byron,
                path: "m/44'/1815'/0'/0/2",
            },
            protocolMagic: PROTOCOL_MAGICS['testnet'],
            networkId: NETWORK_IDS['testnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                address: '2657WMsDfac5F3zbgs9BwNWx3dhGAJERkAL93gPa68NJ2i8mbCHm2pLUHWSj8Mfea',
            },
        },
        {
            payload: {
                address: '2657WMsDfac6ezKWszxLFqJjSUgpg9NgxKc1koqi24sVpRaPhiwMaExk4useKn5HA',
            },
        },
        {
            payload: {
                address: '2657WMsDfac7hr1ioJGr6g7r6JRx4r1My8Rj91tcPTeVjJDpfBYKURrPG2zVLx2Sq',
            },
        },
    ];

    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_all',
        testPayloads,
        expectedResponses,
    };
};

const getBaseAddress = () => {
    const testPayloads: CardanoGetAddress[] = [
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Base,
                path: "m/1852'/1815'/4'/0/0",
                stakingPath: "m/1852'/1815'/4'/2/0",
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Base,
                path: "m/1852'/1815'/4'/0/0",
                stakingPath: "m/1852'/1815'/4'/2/0",
            },
            protocolMagic: PROTOCOL_MAGICS['testnet'],
            networkId: NETWORK_IDS['testnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Base,
                path: "m/1852'/1815'/4'/0/0",
                stakingKeyHash: '1bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff',
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Base,
                path: "m/1852'/1815'/4'/0/0",
                stakingKeyHash: '1bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff',
            },
            protocolMagic: PROTOCOL_MAGICS['testnet'],
            networkId: NETWORK_IDS['testnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                address: 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqsx9990',
            },
        },
        {
            payload: {
                address: 'addr_test1qrv42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqnsc9fs',
            },
        },
        {
            payload: {
                address: 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wsmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsydc62k',
            },
        },
        {
            payload: {
                address: 'addr_test1qrv42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wsmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hls8m96xf',
            },
        },
    ];

    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_all',
        testPayloads,
        expectedResponses,
    };
};

const getEnterpriseAddress = () => {
    const testPayloads: CardanoGetAddress[] = [
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Enterprise,
                path: "m/1852'/1815'/0'/0/0",
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Enterprise,
                path: "m/1852'/1815'/0'/0/0",
            },
            protocolMagic: PROTOCOL_MAGICS['testnet'],
            networkId: NETWORK_IDS['testnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                address: 'addr1vxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92su77c6m',
            },
        },
        {
            payload: {
                address: 'addr_test1vzq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92s8k2y47',
            },
        },
    ];

    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_all',
        testPayloads,
        expectedResponses,
    };
};

const getPointerAddress = () => {
    const testPayloads: CardanoGetAddress[] = [
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Pointer,
                path: "m/1852'/1815'/0'/0/0",
                certificatePointer: {
                    blockIndex: 1,
                    txIndex: 2,
                    certificateIndex: 3,
                },
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Pointer,
                path: "m/1852'/1815'/0'/0/0",
                certificatePointer: {
                    blockIndex: 24157,
                    txIndex: 177,
                    certificateIndex: 42,
                },
            },
            protocolMagic: PROTOCOL_MAGICS['testnet'],
            networkId: NETWORK_IDS['testnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                address: 'addr1gxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92spqgpsl97q83',
            },
        },
        {
            payload: {
                address: 'addr_test1gzq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z925ph3wczvf2ag2x9t',
            },
        },
    ];

    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_all',
        testPayloads,
        expectedResponses,
    };
};

const getRewardAddress = () => {
    const testPayloads: CardanoGetAddress[] = [
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Reward,
                path: "m/1852'/1815'/0'/2/0",
            },
            protocolMagic: PROTOCOL_MAGICS['mainnet'],
            networkId: NETWORK_IDS['mainnet'],
        },
        {
            method: 'cardanoGetAddress',
            addressParameters: {
                addressType: CARDANO_ADDRESS_TYPE.Reward,
                path: "m/1852'/1815'/0'/2/0",
            },
            protocolMagic: PROTOCOL_MAGICS['testnet'],
            networkId: NETWORK_IDS['testnet'],
        },
    ];

    const expectedResponses = [
        {
            payload: {
                address: 'stake1uyfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacalmqha',
            },
        },
        {
            payload: {
                address: 'stake_test1uqfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yac643znq',
            },
        },
    ];

    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_all',
        testPayloads,
        expectedResponses,
    };
};

export const cardanoGetAddress = () => {
    const availableSubtests = {
        getByronAddressMainnet,
        getByronAddressTestnet,
        getBaseAddress,
        getEnterpriseAddress,
        getPointerAddress,
        getRewardAddress,
    };
    return {
        testName: 'CardanoGetAddress',
        mnemonic: 'mnemonic_all',
        subtests: {
            ...availableSubtests,
        },
    };
};
