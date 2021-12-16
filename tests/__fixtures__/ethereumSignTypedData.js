import commonFixtures from '../../submodules/trezor-common/tests/fixtures/ethereum/sign_typed_data.json';

export default {
    method: 'ethereumSignTypedData',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests.flatMap(({ name, parameters, result }) => {
        const fixture = {
            description: `${name} ${parameters.comment ?? ''}`,
            name,
            params: parameters,
            result: {
                address: result.address,
                signature: result.sig,
            },
        };
        return fixture;
    }),
};
