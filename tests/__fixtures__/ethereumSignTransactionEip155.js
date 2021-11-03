import commonFixtures from '../../submodules/trezor-common/tests/fixtures/ethereum/sign_tx_eip155.json';

export default {
    method: 'ethereumSignTransaction',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests
        // exclude test using integer value higher than Number.maxSafeInteger
        .filter(f => !['max_uint64'].includes(f.name))
        .flatMap(({ name, parameters, result }) => {
            const fixture = {
                description: `Eip155 ${name} ${parameters.comment ?? ''}`,
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

            return fixture;
        }),
};
