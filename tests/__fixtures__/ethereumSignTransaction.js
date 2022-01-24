import commonFixtures from '../../submodules/trezor-common/tests/fixtures/ethereum/sign_tx.json';

export default {
    method: 'ethereumSignTransaction',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests
        .flatMap(({ name, parameters, result }) => {
            const fixture = {
                description: `${name} ${parameters.comment ?? ''}`,
                params: {
                    path: parameters.path,
                    transaction: {
                        to: parameters.to_address,
                        chainId: parameters.chain_id,
                        value: parameters.value,
                        nonce: parameters.nonce,
                        gasLimit: parameters.gas_limit,
                        gasPrice: parameters.gas_price,
                    },
                },
                result: {
                    r: `0x${result.sig_r}`,
                    s: `0x${result.sig_s}`,
                    v: `0x${result.sig_v.toString(16)}`,
                },
            };

            if (parameters.data) {
                fixture.params.transaction.data = parameters.data;
            }

            if (parameters.tx_type) {
                fixture.params.transaction.txType = parameters.tx_type;
            }

            return fixture;
        })
        // Cross-chain transaction
        .concat([
            {
                description: 'Cross-chain transaction not allowed (missing param)',
                params: {
                    path: 'm/0',
                    transaction: {
                        nonce: '0x0',
                        gasPrice: '0x4e20',
                        gasLimit: '0x4e20',
                        to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                        value: '0xab54a98ceb1f0ad2',
                        chainId: 1,
                    },
                },
                result: false,
            },
            {
                description: 'Cross-chain transaction allowed',
                params: {
                    path: 'm/0',
                    crossChain: true,
                    transaction: {
                        nonce: '0x1e240',
                        gasPrice: '0x4e20',
                        gasLimit: '0x4e20',
                        to: '0x1d1c328764a41bda0492b66baa30c4a339ff85ef',
                        value: '0xab54a98ceb1f0ad2',
                        chainId: 1,
                    },
                },
                result: {
                    r: '0xb5c20b25405169a930f550c86cd4513c27213949a0f7e3c31aa13dda84f6c8b6',
                    s: '0x4e8a1f8a381a54b5cda09d61a638db3b23ec6069eddd4c909ab1861fd8b886e3',
                    v: '0x26',
                },
            },
        ])
        // Expect failure scenarios
        .concat([
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
                        chainId: 1,
                    },
                },
                result: false,
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
                        chainId: 1,
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
        ]),
};
