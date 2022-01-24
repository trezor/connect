import commonFixtures from '../../submodules/trezor-common/tests/fixtures/ethereum/getaddress.json';

export default {
    method: 'ethereumGetAddress',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests
        .flatMap(({ parameters: params, result }) => ({
            description: params.path,
            params,
            result,
        }))
        // Cross-chain transaction
        .concat([
            {
                description: 'Cross-chain address not allowed (missing param)',
                params: {
                    path: 'm/0',
                },
                result: false,
            },
            {
                description: 'Cross-chain address allowed',
                params: {
                    path: 'm/0',
                    crossChain: true,
                },
                result: {
                    address: '0x79Ede05D278bD572E962a5f952018D25b77A21A5',
                },
            },
        ]),
};
