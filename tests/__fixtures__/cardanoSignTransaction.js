import {
    ADDRESS_TYPE,
    CERTIFICATE_TYPE,
    NETWORK_IDS,
    PROTOCOL_MAGICS,
} from '../../src/js/constants/cardano';

// vectors from https://github.com/trezor/trezor-firmware/tree/master/python/trezorlib/tests/device_tests/test_msg_cardano_sign_transaction.py

const SAMPLE_INPUTS = {
    byron_input: {
        path: "m/44'/1815'/0'/0/1",
        prev_hash: '1af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc',
        prev_index: 0,
    },
    shelley_input: {
        path: "m/1852'/1815'/0'/0/0",
        prev_hash: '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
        prev_index: 0,
    },
    external_input: {
        path: undefined,
        prev_hash: '3b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b7',
        prev_index: 0,
    },
};

const SAMPLE_OUTPUTS = {
    simple_byron_output: {
        address: 'Ae2tdPwUPEZCanmBz5g2GEwFqKTKpNJcGYPKfDxoNeKZ8bRHr8366kseiK2',
        amount: '3003112',
    },
    byron_change_output: {
        addressParameters: {
            addressType: ADDRESS_TYPE.Byron,
            path: "m/44'/1815'/0'/0/1",
        },
        amount: '1000000',
    },
    simple_shelley_output: {
        address: 'addr1q84sh2j72ux0l03fxndjnhctdg7hcppsaejafsa84vh7lwgmcs5wgus8qt4atk45lvt4xfxpjtwfhdmvchdf2m3u3hlsd5tq5r',
        amount: '1',
    },
    base_address_with_script_output: {
        address: 'addr1z90z7zqwhya6mpk5q929ur897g3pp9kkgalpreny8y304r2dcrtx0sf3dluyu4erzr3xtmdnzvcyfzekkuteu2xagx0qeva0pr',
        amount: '7120787',
    },
    base_address_change_output: {
        addressParameters: {
            addressType: ADDRESS_TYPE.Base,
            path: "m/1852'/1815'/0'/0/0",
            stakingPath: "m/1852'/1815'/0'/2/0",
        },
        amount: '7120787',
    },
    base_address_change_output_numbers: {
        addressParameters: {
            addressType: ADDRESS_TYPE.Base,
            path: [0x80000000 + 1852, 0x80000000 + 1815, 0x80000000, 0, 0],
            stakingPath: [0x80000000 + 1852, 0x80000000 + 1815, 0x80000000, 2, 0],
        },
        amount: '7120787',
    },
    staking_key_hash_output: {
        addressParameters: {
            addressType: ADDRESS_TYPE.Base,
            path: "m/1852'/1815'/0'/0/0",
            stakingKeyHash: '32c728d3861e164cab28cb8f006448139c8f1740ffb8e7aa9e5232dc',
        },
        amount: '7120787',
    },
    pointer_address_output: {
        addressParameters: {
            addressType: ADDRESS_TYPE.Pointer,
            path: "m/1852'/1815'/0'/0/0",
            certificatePointer: {
                blockIndex: 1,
                txIndex: 2,
                certificateIndex: 3,
            },
        },
        amount: '7120787',
    },
    enterprise_address_output: {
        addressParameters: {
            addressType: ADDRESS_TYPE.Enterprise,
            path: "m/1852'/1815'/0'/0/0",
        },
        amount: '7120787',
    },
    testnet_output: {
        address: '2657WMsDfac7BteXkJq5Jzdog4h47fPbkwUM49isuWbYAr2cFRHa3rURP236h9PBe',
        amount: '3003112',
    },
    shelley_testnet_output: {
        address: 'addr_test1vr9s8py7y68e3x66sscs0wkhlg5ssfrfs65084jrlrqcfqqtmut0e',
        amount: '1',
    },
};

const SAMPLE_CERTIFICATES = {
    stake_registration: {
        type: CERTIFICATE_TYPE.StakeRegistration,
        path: "m/1852'/1815'/0'/2/0",
    },
    stake_deregistration: {
        type: CERTIFICATE_TYPE.StakeDeregistration,
        path: "m/1852'/1815'/0'/2/0",
    },
    stake_delegation: {
        type: CERTIFICATE_TYPE.StakeDelegation,
        path: "m/1852'/1815'/0'/2/0",
        pool: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
    },
    stake_pool_registration: {
        type: CERTIFICATE_TYPE.StakePoolRegistration,
        poolParameters: {
            poolId: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
            vrfKeyHash: "198890ad6c92e80fbdab554dda02da9fb49d001bbd96181f3e07f7a6ab0d0640",
            pledge: "500000000",
            cost: "340000000",
            margin: {
                numerator: "1",
                denominator: "2",
            },
            rewardAccount: "stake1uya87zwnmax0v6nnn8ptqkl6ydx4522kpsc3l3wmf3yswygwx45el",
            owners: [
                {
                    stakingKeyPath: "m/1852'/1815'/0'/2/0",
                    stakingKeyHash: undefined,
                },
                {
                    stakingKeyHash: "3a7f09d3df4cf66a7399c2b05bfa234d5a29560c311fc5db4c490711"
                }
            ],
            relays: [
                {
                    type: 0,
                    ipv4Address: "192.168.0.1",
                    ipv6Address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
                    port: 1234
                },
                {
                    type: 0,
                    ipv6Address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
                    ipv4Address: null,
                    port: 1234
                },
                {
                    type: 0,
                    ipv4Address: "192.168.0.1",
                    port: 1234
                },
                {
                    type: 1,
                    hostName: "www.test.test",
                    port: 1234
                },
                {
                    type: 2,
                    hostName: "www.test2.test"
                }
            ],
            metadata: {
                url: "https://www.test.test",
                hash: "914c57c1f12bbf4a82b12d977d4f274674856a11ed4b9b95bd70f5d41c5064a6"
            }
        }
    },
    stake_pool_registration_no_metadata: {
        type: CERTIFICATE_TYPE.StakePoolRegistration,
        poolParameters: {
            poolId: "f61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973",
            vrfKeyHash: "198890ad6c92e80fbdab554dda02da9fb49d001bbd96181f3e07f7a6ab0d0640",
            pledge: "500000000",
            cost: "340000000",
            margin: {
                numerator: "1",
                denominator: "2",
            },
            rewardAccount: "stake1uya87zwnmax0v6nnn8ptqkl6ydx4522kpsc3l3wmf3yswygwx45el",
            owners: [
                {
                    stakingKeyPath: "m/1852'/1815'/0'/2/0"
                },
            ],
            relays: [],
            metadata: null,
        }
    }
};

const SAMPLE_WITHDRAWAL = {
    path: "m/1852'/1815'/0'/2/0",
    amount: '1000',
};

const FEE = '42';
const TTL = '10';

export default {
    method: 'cardanoSignTransaction',
    setup: {
        mnemonic: 'mnemonic_all',
    },
    tests: [
        {
            description: 'signMainnetNoChange',
            params: {
                inputs: [SAMPLE_INPUTS['byron_input']],
                outputs: [SAMPLE_OUTPUTS['simple_byron_output']],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '73e09bdebf98a9e0f17f86a2d11e0f14f4f8dae77cdf26ff1678e821f20c8db6',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018182582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e802182a030aa1028184582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840da07ac5246e3f20ebd1276476a4ae34a019dd4b264ffc22eea3c28cb0f1a6bb1c7764adeecf56bcb0bc6196fd1dbe080f3a7ef5b49f56980fe5b2881a4fdfa00582026308151516f3b0e02bb1638142747863c520273ce9bd3e5cd91e1d46fe2a63541a0f6',
            },
        },

        {
            description: 'signMainnetChange',
            params: {
                inputs: [SAMPLE_INPUTS['byron_input']],
                outputs: [
                    SAMPLE_OUTPUTS['simple_byron_output'],
                    SAMPLE_OUTPUTS['byron_change_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '81b14b7e62972127eb33c0b1198de6430540ad3a98eec621a3194f2baac43a43',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018282582b82d818582183581c9e1c71de652ec8b85fec296f0685ca3988781c94a2e1a5d89d92f45fa0001a0d0c25611a002dd2e882582b82d818582183581cda4da43db3fca93695e71dab839e72271204d28b9d964d306b8800a8a0001a7a6916a51a000f424002182a030aa1028184582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840d909b16038c4fd772a177038242e6793be39c735430b03ee924ed18026bd28d06920b5846247945f1204276e4b759aa5ac05a4a73b49ce705ab0e5e54a3a170e582026308151516f3b0e02bb1638142747863c520273ce9bd3e5cd91e1d46fe2a63541a0f6',
            },
        },

        {
            description: 'signMainnetBaseAddress',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [
                    SAMPLE_OUTPUTS['simple_shelley_output'],
                    SAMPLE_OUTPUTS['base_address_change_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '16fe72bb198be423677577e6326f1f648ec5fc11263b072006382d8125a6edda',
                serializedTx: '83a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff018258390180f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b42771a006ca79302182a030aa100818258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c158406a78f07836dcf4a303448d2b16b217265a9226be3984a69a04dba5d04f4dbb2a47b5e1cbb345f474c0b9634a2f37b921ab26e6a65d5dfd015dacb4455fb8430af6',
            },
        },

        {
            description: 'signMainnetBaseAddressNumbers',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [
                    SAMPLE_OUTPUTS['simple_shelley_output'],
                    SAMPLE_OUTPUTS['base_address_change_output_numbers'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '16fe72bb198be423677577e6326f1f648ec5fc11263b072006382d8125a6edda',
                serializedTx: '83a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff018258390180f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b42771a006ca79302182a030aa100818258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c158406a78f07836dcf4a303448d2b16b217265a9226be3984a69a04dba5d04f4dbb2a47b5e1cbb345f474c0b9634a2f37b921ab26e6a65d5dfd015dacb4455fb8430af6',
            },
        },

        {
            description: 'signMainnetBaseHashAddress',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [
                    SAMPLE_OUTPUTS['simple_shelley_output'],
                    SAMPLE_OUTPUTS['staking_key_hash_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: 'd1610bb89bece22ed3158738bc1fbb31c6af0685053e2993361e3380f49afad9',
                serializedTx: '83a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff018258390180f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa32c728d3861e164cab28cb8f006448139c8f1740ffb8e7aa9e5232dc1a006ca79302182a030aa100818258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c15840622f22d03bc9651ddc5eb2f5dc709ac4240a64d2b78c70355dd62106543c407d56e8134c4df7884ba67c8a1b5c706fc021df5c4d0ff37385c30572e73c727d00f6',
            },
        },

        {
            description: 'signMainnetPointerAddress',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [
                    SAMPLE_OUTPUTS['simple_shelley_output'],
                    SAMPLE_OUTPUTS['pointer_address_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '40535fa8f88515f1da008d3cdf544cf9dbf1675c3cb0adb13b74b9293f1b7096',
                serializedTx: '83a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff018258204180f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa0102031a006ca79302182a030aa100818258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c15840dbbf050cc13d0696b1884113613318a275e6f0f8c7cb3e7828c4f2f3c158b2622a5d65ea247f1eed758a0f6242a52060c319d6f37c8460f5d14be24456cd0b08f6',
            },
        },

        {
            description: 'signMainnetEnterpriseAddress',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [
                    SAMPLE_OUTPUTS['simple_shelley_output'],
                    SAMPLE_OUTPUTS['enterprise_address_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: 'd3570557b197604109481a80aeb66cd2cfabc57f802ad593bacc12eb658e5d72',
                serializedTx: '83a400818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018282583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff0182581d6180f9e2c88e6c817008f3a812ed889b4a4da8e0bd103f86e7335422aa1a006ca79302182a030aa100818258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c15840c5996650c438c4493b2c8a94229621bb9b151b8d61d75fb868c305e917031e9a1654f35023f7dbf5d1839ab9d57b153c7f79c2666af51ecf363780397956e00af6',
            },
        },

        {
            description: 'signStakeRegistration',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [SAMPLE_OUTPUTS['simple_shelley_output']],
                fee: FEE,
                ttl: TTL,
                certificates: [SAMPLE_CERTIFICATES['stake_registration']],
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '1a3a295908afd8b2afc368071272d6964be6ee0af062bb765aea65ca454dc0c9',
                serializedTx: '83a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff0102182a030a048182008200581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277a100818258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c15840a938b16bd81aea8d3aaf11e4d460dad1f36d34bf34ad066d0f5ce5d4137654145d998c3482aa823ff1acf021c6e2cd2774fff00361cbb9e72b98632307ee4000f6',
            },
        },

        {
            description: 'signStakeRegistrationAndDelegation',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [SAMPLE_OUTPUTS['simple_shelley_output']],
                fee: FEE,
                ttl: TTL,
                certificates: [
                    SAMPLE_CERTIFICATES['stake_registration'],
                    SAMPLE_CERTIFICATES['stake_delegation'],
                ],
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '439764b5f7e08839881536a3191faeaf111e75d9f00f83b102c5c1c6fa9fcaf9',
                serializedTx: '83a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff0102182a030a048282008200581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b427783028200581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb4973a10082825820bc65be1b0b9d7531778a1317c2aa6de936963c3f9ac7d5ee9e9eda25e0c97c5e58400dbdf36f92bc5199526ffb8b83b33a9eeda0ed3e46fb4025a104346801afb9cf45fa1a5482e54c769f4102e67af46205457d7ae05a889fc342acb0cdc23ecd038258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c158405ebe8eff752f07e8448f55304fdf3665ac68162099dcacd81886b73affe67fb6df401f8a5fa60ddb6d5fb65b93235e6a234182a40c001e3cf7634f82afd5fe0af6',
            },
        },

        {
            description: 'signStakeDeregistration',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [SAMPLE_OUTPUTS['simple_shelley_output']],
                fee: FEE,
                ttl: TTL,
                certificates: [SAMPLE_CERTIFICATES['stake_deregistration']],
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '3aca1784d151dc75bdbb80fae71bda3f4b26af3f5fd71bd5e9e9bbcdd2b64ad1',
                serializedTx: '83a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff0102182a030a048182018200581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277a10082825820bc65be1b0b9d7531778a1317c2aa6de936963c3f9ac7d5ee9e9eda25e0c97c5e584084f321d313da67f80f7fab2e4f3996d3dbe3186659e6f98315e372dbe88c55d56f637ccc7534890c3601ddd31ba885dc86ba0074c230869f20099b7dd5eeaf008258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c15840e563a8012e16affd801564e8410ca7b2c96f76f8ecb878e35c098a823c40be7f59dc12cb44a9b678210d4e8f18ab215133eef7ca9ece94b4683d3db0fd37e105f6',
            },
        },

        {
            description: 'signStakeDeregistrationAndWithdrawal',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [SAMPLE_OUTPUTS['simple_shelley_output']],
                fee: FEE,
                ttl: TTL,
                certificates: [SAMPLE_CERTIFICATES['stake_deregistration']],
                withdrawals: [SAMPLE_WITHDRAWAL],
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '22c67f12e6f6aa0f2f09fd27d472b19c7208ccd7c3af4b09604fd5d462c1de2b',
                serializedTx: '83a600818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff0102182a030a048182018200581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b427705a1581de1122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b42771903e8a10082825820bc65be1b0b9d7531778a1317c2aa6de936963c3f9ac7d5ee9e9eda25e0c97c5e58400202826a8b9688cf978000e7d1591582c65b149bb9f55dc883ae1acf85432618ca32be8a06fef37e69df503a294e7093006f63ababf9fcea639390226934020a8258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c158407efa634e42fa844cad5f60bf005d645817cc674f30eaab0da398b99034850780b40ab5a1028da033330a0f82b01648ec92cff8ca85a072594efb298016f38d0df6',
            },
        },

        {
            description: 'signMetadata',
            params: {
                inputs: [SAMPLE_INPUTS['shelley_input']],
                outputs: [SAMPLE_OUTPUTS['simple_shelley_output']],
                fee: FEE,
                ttl: TTL,
                metadata: 'a200a11864a118c843aa00ff01a119012c590100aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
            },
            result: {
                hash: '1875f1d59a53f1cb4c43949867d72bcfd857fa3b64feb88f41b78ddaa1a21cbf',
                serializedTx: '83a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff0102182a030a075820ea4c91860dd5ec5449f8f985d227946ff39086b17f10b5afb93d12ee87050b6aa100818258205d010cf16fdeff40955633d6c565f3844a288a24967cf6b76acbeb271b4f13c15840b2015772a91043aeb04b98111744a098afdade0db5e30206538d7f2814965a5800d45240137f4d0dc81845a71e67cda38beaf816a520d73c4decbf7cbf0f6d08a200a11864a118c843aa00ff01a119012c590100aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
            },
        },

        {
            description: 'signTestnet',
            params: {
                inputs: [SAMPLE_INPUTS['byron_input']],
                outputs: [
                    SAMPLE_OUTPUTS['testnet_output'],
                    SAMPLE_OUTPUTS['shelley_testnet_output'],
                    SAMPLE_OUTPUTS['byron_change_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['testnet'],
                networkId: NETWORK_IDS['testnet'],
            },
            result: {
                hash: '47cf79f20c6c62edb4162b3b232a57afc1bd0b57c7fd8389555276408a004776',
                serializedTx: '83a400818258201af8fa0b754ff99253d983894e63a2b09cbb56c833ba18c3384210163f63dcfc00018382582f82d818582583581cc817d85b524e3d073795819a25cdbb84cff6aa2bbb3a081980d248cba10242182a001a0fb6fc611a002dd2e882581d60cb03849e268f989b5a843107bad7fa2908246986a8f3d643f8c184800182582f82d818582583581c98c3a558f39d1d993cc8770e8825c70a6d0f5a9eb243501c4526c29da10242182a001aa8566c011a000f424002182a030aa1028184582089053545a6c254b0d9b1464e48d2b5fcf91d4e25c128afb1fcfc61d0843338ea5840cc11adf81cb3c3b75a438325f8577666f5cbb4d5d6b73fa6dbbcf5ab36897df34eecacdb54c3bc3ce7fc594ebb2c7aa4db4700f4290facad9b611a035af8710a582026308151516f3b0e02bb1638142747863c520273ce9bd3e5cd91e1d46fe2a63545a10242182af6',
            },
        },
        {
            description: 'signStakePoolRegistration',
            params: {
                inputs: [SAMPLE_INPUTS['external_input']],
                outputs: [
                    SAMPLE_OUTPUTS['simple_shelley_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
                certificates: [SAMPLE_CERTIFICATES['stake_pool_registration']],
            },
            result: {
                hash: 'e3b9a5657bf62609465a930c8359d774c73944973cfc5a104a0f0ed1e1e8db21',
                serializedTx: '83a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff0102182a030a04818a03581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49735820198890ad6c92e80fbdab554dda02da9fb49d001bbd96181f3e07f7a6ab0d06401a1dcd65001a1443fd00d81e820102581de13a7f09d3df4cf66a7399c2b05bfa234d5a29560c311fc5db4c49071182581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b4277581c3a7f09d3df4cf66a7399c2b05bfa234d5a29560c311fc5db4c4907118584001904d244c0a8000150b80d01200000a3852e8a00003473700384001904d2f650b80d01200000a3852e8a00003473700384001904d244c0a80001f683011904d26d7777772e746573742e7465737482026e7777772e74657374322e74657374827568747470733a2f2f7777772e746573742e746573745820914c57c1f12bbf4a82b12d977d4f274674856a11ed4b9b95bd70f5d41c5064a6a10081825820bc65be1b0b9d7531778a1317c2aa6de936963c3f9ac7d5ee9e9eda25e0c97c5e584006305b52f76d2d2da6925c02036a9a28456976009f8c6432513f273110d09ea26db79c696cec322b010e5cbb7d90a6b473b157e65df846a1487062569a5f5a04f6',
            },
        },
        {
            description: 'signStakePoolRegistrationNoMetadata',
            params: {
                inputs: [SAMPLE_INPUTS['external_input']],
                outputs: [
                    SAMPLE_OUTPUTS['simple_shelley_output'],
                ],
                fee: FEE,
                ttl: TTL,
                protocolMagic: PROTOCOL_MAGICS['mainnet'],
                networkId: NETWORK_IDS['mainnet'],
                certificates: [SAMPLE_CERTIFICATES['stake_pool_registration_no_metadata']],
            },
            result: {
                hash: '504f9214142996e0b7e315103b25d88a4afa3d01dd5be22376921b52b01483c3',
                serializedTx: '83a500818258203b40265111d8bb3c3c608d95b3a0bf83461ace32d79336579a1939b3aad1c0b700018182583901eb0baa5e570cffbe2934db29df0b6a3d7c0430ee65d4c3a7ab2fefb91bc428e4720702ebd5dab4fb175324c192dc9bb76cc5da956e3c8dff0102182a030a04818a03581cf61c42cbf7c8c53af3f520508212ad3e72f674f957fe23ff0acb49735820198890ad6c92e80fbdab554dda02da9fb49d001bbd96181f3e07f7a6ab0d06401a1dcd65001a1443fd00d81e820102581de13a7f09d3df4cf66a7399c2b05bfa234d5a29560c311fc5db4c49071181581c122a946b9ad3d2ddf029d3a828f0468aece76895f15c9efbd69b427780f6a10081825820bc65be1b0b9d7531778a1317c2aa6de936963c3f9ac7d5ee9e9eda25e0c97c5e5840aa2099208399fcc27c18d7ef0c7e873f9e22f0935b7e912cddd34b33b8cafd541a878dc01c042ce490e4c9bad3c62c2f59acaa009d336c9ff875c5f153d34900f6',
            },
        },
    ],
};
