export default {
    method: 'ethereumSignTransaction',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: 'known erc20 token',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x0',
                    gasPrice: '0x14',
                    gasLimit: '0x14',
                    to: '0xd0d6d6c5fe4a677d343cc433536bb717bae167dd',
                    chainId: 1,
                    value: '0x0',
                    data:
                        '0xa9059cbb000000000000000000000000574bbb36871ba6b78e27f4b4dcfb76ea0091880b000000000000000000000000000000000000000000000000000000000bebc200',
                },
            },
            result: {
                r: '0xaa0c28d61c7c9382a256ead609d5b713cfe17c3aa3a6facb6b60342883db448e',
                s: '0x039d88ed4ce5416680117dbee92f86976b381241786f1ffaf058c8e80cb25c63',
            },
        },

        {
            description: 'unknown erc20 token',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x0',
                    gasPrice: '0x14',
                    gasLimit: '0x14',
                    to: '0xfc6b5d6af8a13258f7cbd0d39e11b35e01a32f93',
                    chainId: 1,
                    value: '0x0',
                    data:
                        '0xa9059cbb000000000000000000000000574bbb36871ba6b78e27f4b4dcfb76ea0091880b0000000000000000000000000000000000000000000000000000000000000123',
                },
            },
            result: {
                r: '0xafd33dc30cf829e3fde2575f189b9f80a6e7cfe3bbad8554f1015b29c33fb13d',
                s: '0x5a4efd7242bae4e460ae2e608470ee19237246f72601bf879d0444100d6ae9ab',
            },
        },

        {
            description: 'no data',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x0',
                    gasPrice: '0x14',
                    gasLimit: '0x14',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xa',
                },
            },
            result: {
                r: '0xff2676c3d23f4ed59b41a284348b6e4cc56fa4b4c06ab2cd2cfa0fc85d3d5b72',
                s: '0x180682139cb3ec01d8371bd42996c689e2f11a14c89b2c57494a6020bae09417',
                v: '0x1b',
            },
        },

        {
            description: 'no data',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x1e240',
                    gasPrice: '0x4e20',
                    gasLimit: '0x4e20',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xab54a98ceb1f0ad2',
                },
            },
            result: {
                r: '0x324f82ca8a681ea882f7abfcc396addd13b4a947d65d3cf972c2a44cfbc35c89',
                s: '0x6fddb0aa918ab0ff5bd09368b4edec21e9a626c1acf8d839b821784db2b44fac',
                v: '0x1c',
            },
        },

        {
            description: 'data',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x0',
                    gasPrice: '0x14',
                    gasLimit: '0x14',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xa',
                    data: `0x${'6162636465666768696a6b6c6d6e6f70'.repeat(16)}`,
                },
            },
            result: {
                r: '0xc07ca9b87ebf87620396a16cd575ac68dbef0eb0b22481f8f62facfe40fc4c7a',
                s: '0x3e2f26e2fb739cfeafee82f3f74ecd0b88dfba4d3cf850eb10f53569f424f3a0',
                v: '0x1c',
            },
        },

        {
            description: 'data',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x1e240',
                    gasPrice: '0x4e20',
                    gasLimit: '0x4e20',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xab54a98ceb1f0ad2',
                    data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
                },
            },
            result: {
                r: '0x2a27c485c02cdd4796eab5624cca2e5024b3567ff04ac144a0cb2a46c8bef98c',
                s: '0x56e5ca6a6adb6ee90e4749f3b28f372ccc8b3ba9a51ec1e739ba1cba0cc7eba5',
                v: '0x1c',
            },
        },

        {
            description: 'message',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x0',
                    gasPrice: '0x4e20',
                    gasLimit: '0x4e20',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0x0',
                    data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
                },
            },
            result: {
                r: '0xce5c299678f8ba333c219a3f70f01f7281bf4716cf4c2d47518f689cf3344dc4',
                s: '0x194495dedbcbfdc6bbccfd83f1b8b5a2802e5da1c86e61731ffbc59e5b1719b2',
                v: '0x1c',
            },
        },

        {
            description: 'new contract',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x1e240',
                    gasPrice: '0x4e20',
                    gasLimit: '0x4e20',
                    to: '',
                    value: '0xab54a98ceb1f0ad2',
                },
            },
            result: false,
        },

        {
            description: 'new contract',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x0',
                    gasPrice: '0x4e20',
                    gasLimit: '0x4e20',
                    to: '',
                    value: '0xab54a98ceb1f0ad2',
                    data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
                },
            },
            result: {
                r: '0x05249f09ef32544c07aba09767f4dbe5248472b5c5250e77911a034e0978041a',
                s: '0x0239c60830534b34db1c4c3d715253f2ed2786a322c6218c424188ccf0f0f464',
                v: '0x1b',
            },
        },

        {
            description: 'gas overflow',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x1e240',
                    gasPrice: '0xffffffffffffffffffffffffffffffff',
                    gasLimit: '0xffffffffffffffffffffffffffffffff',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xab54a98ceb1f0ad2',
                },
            },
            result: false,
        },

        {
            description: 'no gas price',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x1e240',
                    gasLimit: '0x2710',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xab54a98ceb1f0ad2',
                },
            },
            result: false,
        },

        {
            description: 'no gas limit',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x1e240',
                    gasPrice: '0x2710',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xab54a98ceb1f0ad2',
                },
            },
            result: false,
        },

        {
            description: 'no nonce',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    gasLimit: '0x2710',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xab54a98ceb1f0ad2',
                },
            },
            result: false,
        },

        {
            description: 'no data eip155',
            params: {
                path: "m/44'/1'/0'/0/0",
                transaction: {
                    nonce: '0x0',
                    gasPrice: '0x4a817c800',
                    gasLimit: '0x5208',
                    to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                    value: '0x16345785d8a0000',
                    chainId: 3,
                },
            },
            result: {
                r: '0x39aa7798b8debf2db32945d929d25bd9c514e7f7e6a1f1c72bcbf0600f9f2db3',
                s: '0x66e3a42fde7e7eb1096bc1f90342914612019688d97fe6b0571f420b5ddcb64c',
                v: '0x29',
            },
        },

        {
            description: 'no data eip155',
            params: {
                path: "m/44'/1'/0'/0/0",
                transaction: {
                    nonce: '0x1',
                    gasPrice: '0x4a817c800',
                    gasLimit: '0x5208',
                    to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                    value: '0x16345785d8a0000',
                    chainId: 3,
                },
            },
            result: {
                r: '0x0283d00760697f456534ad547cb1aa0542527929bbe13d82877be23505a5b012',
                s: '0x2db7e0ea93dedf0226675b1b0498c1568c76e0c2d69dbfabb65bfa1412fb773b',
                v: '0x29',
            },
        },

        {
            description: 'data eip155',
            params: {
                path: "m/44'/1'/0'/0/0",
                transaction: {
                    nonce: '0x2',
                    gasPrice: '0x4a817c800',
                    gasLimit: '0x520c',
                    to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                    value: '0x16345785d8a0000',
                    data: '0x0',
                    chainId: 3,
                },
            },
            result: {
                r: '0xdbae2f01331e274f24831afadaa86f1da08c9cf9e28b120acc17ec4a748c533a',
                s: '0x2e2a390c4afd7617d654b9affdee21b9b593964f19ac618039007b2c6677563f',
                v: '0x29',
            },
        },

        {
            description: 'data eip155',
            params: {
                path: "m/44'/1'/0'/0/0",
                transaction: {
                    nonce: '0x3',
                    gasPrice: '0x4a817c800',
                    gasLimit: '0x492d4',
                    to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                    value: '0x16345785d8a0000',
                    data: `0x${'4142434445464748494a4b4c4d4e4f50'.repeat(256)}212121`,
                    chainId: 3,
                },
            },
            result: {
                r: '0x8ceec1dc6f52a6ff4d17584ebbae00e9d6210a960fba29095f077d57e0dbc28d',
                s: '0x3dd7d1b01c399d70a81fae0c0e5a306d1456b6f9a8d38514763d747af1e74c38',
                v: '0x29',
            },
        },

        {
            description: 'data eip155',
            params: {
                path: "m/44'/1'/0'/0/0",
                transaction: {
                    nonce: '0x4',
                    gasPrice: '0x4a817c800',
                    gasLimit: '0x520c',
                    to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                    value: '0x0',
                    data: '0x0',
                    chainId: 3,
                },
            },
            result: {
                r: '0x0672d6eb1b238b225be64dcbe39f52a9fb376c3cc47ec3d3dd28c94fcaac98fe',
                s: '0x677959c411ef54889448de94661dfddef91292da7dd9a5855b9ee71bcd2bba6f',
                v: '0x29',
            },
        },

        {
            description: 'data eip155',
            params: {
                path: "m/44'/1'/0'/0/0",
                transaction: {
                    nonce: '0x5',
                    gasPrice: '0x0',
                    gasLimit: '0x520c',
                    to: '0x8ea7a3fccc211ed48b763b4164884ddbcf3b0a98',
                    value: '0x0',
                    data: '0x0',
                    chainId: 3,
                },
            },
            result: {
                r: '0x23e1a4e27fd9926621bd75ecd7519e324a18a6ca156cafd522a9445096217360',
                s: '0x4cdc7f2d028449acd0c2b72aeaab20d571e0cf6439a2e4b3cb5f45ff7a92d2d9',
                v: '0x2a',
            },
        },

        {
            description: 'no data eip 1559',
            mnemonic: 'mnemonic_all',
            params: {
                path: "m/44'/60'/0'/0/100",
                transaction: {
                    nonce: '0x0',
                    maxFeePerGas: '0x20',
                    maxPriorityFeePerGas: '0x1',
                    gasLimit: '0x20',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0x10',
                    chainId: 1,
                },
            },
            result: {
                r: '0x2ceeaabc994fbce2fbd66551f9d48fc711c8db2a12e93779eeddede11e41f636',
                s: '0x2db4a9ecc73da91206f84397ae9287a399076fdc01ed7f3c6554b1c57c39bf8c',
                v: '0x1',
            },
        },

        {
            description: 'data eip 1559',
            mnemonic: 'mnemonic_all',
            params: {
                path: "m/44'/60'/0'/0/0",
                transaction: {
                    nonce: '0x0',
                    maxFeePerGas: '0x20',
                    maxPriorityFeePerGas: '0x1',
                    gasLimit: '0x20',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0x10',
                    chainId: 1,
                    data: "0x6162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f706162636465666768696a6b6c6d6e6f70"
                },
            },
            result: {
                r: '0x8e4361e40e76a7cab17e0a982724bbeaf5079cd02d50c20d431ba7dde2404ea4',
                s: '0x411930f091bb508e593e22a9ee45bd4d9eeb504ac398123aec889d5951bdebc3',
                v: '0x1',
            },
        },

        {
            description: 'data eip 1559',
            mnemonic: 'mnemonic_all',
            params: {
                path: "m/44'/60'/0'/0/0",
                transaction: {
                    nonce: '0x12356',
                    maxFeePerGas: '0x20',
                    maxPriorityFeePerGas: '0x1',
                    gasLimit: '0x20000',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0x12345678901234567890',
                    chainId: 1,
                    data: "4142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f504142434445464748494a4b4c4d4e4f50212121"
                },
            },
            result: {
                r: '0x2e4f4c0e7c4e51270b891480060712e9d3bcab01e8ad0fadf2dfddd71504ca94',
                s: '0x2599beb32757a144dedc82b79153c21269c9939a9245342bcf35764115b62bc1',
                v: '0x0',
            },
        },

        {
            description: 'eip 1559 access list',
            mnemonic: 'mnemonic_all',
            params: {
                path: "m/44'/60'/0'/0/100",
                transaction: {
                    nonce: '0x0',
                    maxFeePerGas: '0x20',
                    maxPriorityFeePerGas: '0x1',
                    gasLimit: '0x20',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0x10',
                    chainId: 1,
                    accessList: [{
                        address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
                        storageKeys: [
                          '0x0000000000000000000000000000000000000000000000000000000000000003',
                          '0x0000000000000000000000000000000000000000000000000000000000000007'
                        ]
                      }]
                },
            },
            result: {
                r: '0x9f8763f3ff8d4d409f6b96bc3f1d84dd504e2c667b162778508478645401f121',
                s: '0x51e30b68b9091cf8138c07380c4378c2711779b68b2e5264d141479f13a12f57',
                v: '0x1',
            },
        },

        {
            description: 'eip 1559 access list larger',
            mnemonic: 'mnemonic_all',
            params: {
                path: "m/44'/60'/0'/0/100",
                transaction: {
                    nonce: '0x0',
                    maxFeePerGas: '0x20',
                    maxPriorityFeePerGas: '0x1',
                    gasLimit: '0x20',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0x10',
                    chainId: 1,
                    accessList: [{
                        address: '0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae',
                        storageKeys: [
                          '0x0000000000000000000000000000000000000000000000000000000000000003',
                          '0x0000000000000000000000000000000000000000000000000000000000000007'
                        ]
                      },
                      {
                        address: '0xbb9bc244d798123fde783fcc1c72d3bb8c189413',
                        storageKeys: [
                          '0x0000000000000000000000000000000000000000000000000000000000000006',
                          '0x0000000000000000000000000000000000000000000000000000000000000007',
                          '0x0000000000000000000000000000000000000000000000000000000000000009'
                        ]
                      }]
                },
            },
            result: {
                r: '0x718a3a30827c979975c846d2f60495310c4959ee3adce2d89e0211785725465c',
                s: '0x7d0ea2a28ef5702ca763c1f340427c0020292ffcbb4553dd1c8ea8e2b9126dbc',
                v: '0x1',
            },
        },

        {
            description: 'eip 1559 large chain id',
            mnemonic: 'mnemonic_all',
            params: {
                path: "m/44'/60'/0'/0/100",
                transaction: {
                    nonce: '0x0',
                    maxFeePerGas: '0x20',
                    maxPriorityFeePerGas: '0x1',
                    gasLimit: '0x20',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0x10',
                    chainId: 3125659152, // Pirl chain id, doesn't support EIP1559 at this time, but chosen for large chain id
                },
            },
            result: {
                r: '0x07f8c967227c5a190cb90525c3387691a426fe61f8e0503274280724060ea95c',
                s: '0x0bf83eaf74e24aa9146b23e06f9edec6e25acb81d3830e8d146b9e7b6923ad1e',
                v: '0x1',
            },
        },
    ],
};
