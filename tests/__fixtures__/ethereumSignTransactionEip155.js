import commonFixtures from '../../submodules/trezor-common/tests/fixtures/ethereum/sign_tx_eip155.json';

export default {
    method: 'ethereumSignTransaction',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests.flatMap(({ name, parameters, result }) => {
        const fixture = {
            description: `Eip155 ${name} ${parameters.comment ?? ''}`,
            params: {
                path: `m/${parameters.path}`,
                transaction: {
                    to: parameters.to_address,
                    chainId: parameters.chain_id,
                    value: parameters.value.toString(16),
                    nonce: parameters.nonce.toString(16),
                    gasLimit: parameters.gas_limit.toString(16),
                    gasPrice: parameters.gas_price.toString(16),
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
