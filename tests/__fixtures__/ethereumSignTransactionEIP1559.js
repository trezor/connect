export default {
    method: 'ethereumSignTransaction',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            description: 'no data eip 1559',
            params: {
                path: "m/44'/60'/0'",
                transaction: {
                    nonce: '0x0',
                    maxFeePerGas: '0x14',
                    maxPriorityFeePerGas: '0x1',
                    gasLimit: '0x14',
                    to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                    value: '0xa',
                    chainId: 1,
                },
            },
            result: {
                r: '0x2ceeaabc994fbce2fbd66551f9d48fc711c8db2a12e93779eeddede11e41f636',
                s: '0x2db4a9ecc73da91206f84397ae9287a399076fdc01ed7f3c6554b1c57c39bf8c',
                v: '0x1',
            },
        },
    ],
};
