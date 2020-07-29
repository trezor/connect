import { CARDANO_ADDRESS_TYPE } from '../../src/js/types/networks/cardano';

const PROTOCOL_MAGICS = {
    mainnet: 764824073,
    testnet: 42,
};

const NETWORK_IDS = {
    mainnet: 1,
    testnet: 0,
};

export default {
    method: 'cardanoGetAddress',
    setup: {
        mnemonic: 'mnemonic_all',
    },
    tests: [
        {
            description: "Mainnet - m/44'/1815'/0'/0/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Byron,
                    path: "m/44'/1815'/0'/0/0",
                },
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                address: 'Ae2tdPwUPEZ5YUb8sM3eS8JqKgrRLzhiu71crfuH2MFtqaYr5ACNRdsswsZ',
            },
        },
        {
            description: "Byron Mainnet - m/44'/1815'",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Byron,
                    path: "m/44'/1815'",
                },
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: false,
        },
        {
            description: "Byron Mainnet - m/44'/1815'/0'/0/1",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Byron,
                    path: "m/44'/1815'/0'/0/1",
                },
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                address: 'Ae2tdPwUPEZJb8r1VZxweSwHDTYtqeYqF39rZmVbrNK62JHd4Wd7Ytsc8eG',
            },
        },
        {
            description: "Byron Mainnet- m/44'/1815'/0'/0/2",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Byron,
                    path: "m/44'/1815'/0'/0/2",
                },
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                address: 'Ae2tdPwUPEZFm6Y7aPZGKMyMAK16yA5pWWKU9g73ncUQNZsAjzjhszenCsq',
            },
        },
        {
            description: "Byron Testnet - m/44'/1815'/0'/0/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Byron,
                    path: "m/44'/1815'/0'/0/0",
                },
                protocolMagic: PROTOCOL_MAGICS['testnet'],
                networkId: NETWORK_IDS['testnet'],
            },
            result: {
                address: '2657WMsDfac5F3zbgs9BwNWx3dhGAJERkAL93gPa68NJ2i8mbCHm2pLUHWSj8Mfea',
            },
        },
        {
            description: "Byron Testnet - m/44'/1815'/0'/0/1",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Byron,
                    path: "m/44'/1815'/0'/0/1",
                },
                protocolMagic: PROTOCOL_MAGICS['testnet'],
                networkId: NETWORK_IDS['testnet'],
            },
            result: {
                address: '2657WMsDfac6ezKWszxLFqJjSUgpg9NgxKc1koqi24sVpRaPhiwMaExk4useKn5HA',
            },
        },
        {
            description: "Byron Testnet - m/44'/1815'/0'/0/2",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Byron,
                    path: "m/44'/1815'/0'/0/2",
                },
                protocolMagic: PROTOCOL_MAGICS['testnet'],
                networkId: NETWORK_IDS['testnet'],
            },
            result: {
                address: '2657WMsDfac7hr1ioJGr6g7r6JRx4r1My8Rj91tcPTeVjJDpfBYKURrPG2zVLx2Sq',
            },
        },
        {
            description: "Base Mainnet - m/1852'/1815'/4'/0/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Base,
                    path: "m/1852'/1815'/4'/0/0",
                    stakingPath: "m/1852'/1815'/4'/2/0",
                },
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                address: 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqsx9990',
            },
        },
        {
            description: "Base Testnet - m/1852'/1815'/4'/0/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Base,
                    path: "m/1852'/1815'/4'/0/0",
                    stakingPath: "m/1852'/1815'/4'/2/0",
                },
                protocolMagic: PROTOCOL_MAGICS['testnet'],
                networkId: NETWORK_IDS['testnet'],
            },
            result: {
                address: 'addr_test1qrv42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wnrqua2vw243tmjfjt0h5wsru6appuz8c0pfd75ur7myyeqnsc9fs',
            },
        },
        {
            description: "Base Hash Mainnet - m/1852'/1815'/4'/0/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Base,
                    path: "m/1852'/1815'/4'/0/0",
                    stakingKeyHash: '1bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff',
                },
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                address: 'addr1q8v42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wsmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsydc62k',
            },
        },
        {
            description: "Base Hash Testnet - m/1852'/1815'/4'/0/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Base,
                    path: "m/1852'/1815'/4'/0/0",
                    stakingKeyHash: '1bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff',
                },
                protocolMagic: PROTOCOL_MAGICS['testnet'],
                networkId: NETWORK_IDS['testnet'],
            },
            result: {
                address: 'addr_test1qrv42wjda8r6mpfj40d36znlgfdcqp7jtj03ah8skh6u8wsmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hls8m96xf',
            },
        },
        {
            description: "Enterprise Mainnet - m/1852'/1815'/0'/0/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Enterprise,
                    path: "m/1852'/1815'/0'/0/0",
                },
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                address: 'addr1vxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92su77c6m',
            },
        },
        {
            description: "Enterprise Testnet - m/1852'/1815'/0'/0/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Enterprise,
                    path: "m/1852'/1815'/0'/0/0",
                },
                protocolMagic: PROTOCOL_MAGICS['testnet'],
                networkId: NETWORK_IDS['testnet'],
            },
            result: {
                address: 'addr_test1vzq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92s8k2y47',
            },
        },
        {
            description: "Pointer Mainnet - m/1852'/1815'/0'/0/0",
            params: {
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
            result: {
                address: 'addr1gxq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z92spqgpsl97q83',
            },
        },
        {
            description: "Pointer Testnet - m/1852'/1815'/0'/0/0",
            params: {
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
            result: {
                address: 'addr_test1gzq0nckg3ekgzuqg7w5p9mvgnd9ym28qh5grlph8xd2z925ph3wczvf2ag2x9t',
            },
        },
        {
            description: "Reward Mainnet - m/1852'/1815'/0'/2/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Reward,
                    path: "m/1852'/1815'/0'/2/0",
                },
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                address: 'stake1uyfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yacalmqha',
            },
        },
        {
            description: "Reward Testnet - m/1852'/1815'/0'/2/0",
            params: {
                addressParameters: {
                    addressType: CARDANO_ADDRESS_TYPE.Reward,
                    path: "m/1852'/1815'/0'/2/0",
                },
                protocolMagic: PROTOCOL_MAGICS['testnet'],
                networkId: NETWORK_IDS['testnet'],
            },
            result: {
                address: 'stake_test1uqfz49rtntfa9h0s98f6s28sg69weemgjhc4e8hm66d5yac643znq',
            },
        },
    ],
};
