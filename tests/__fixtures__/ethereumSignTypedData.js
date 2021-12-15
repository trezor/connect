import commonFixtures from '../../submodules/trezor-common/tests/fixtures/ethereum/sign_typed_data.json';

export default {
    method: 'ethereumSignTypedData',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests.flatMap(({ name, parameters, result }) => ({
        description: `${name} ${parameters.comment ?? ''}`,
        params: {
            path: parameters.path,
            message: parameters.data,
        },
        result: {
            address: result.address,
            signature: result.sig,
        },
    })),
};
