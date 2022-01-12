import commonFixtures from '../../submodules/trezor-common/tests/fixtures/ethereum/sign_typed_data.json';
// import transformTypedData from '../../src/js/plugins/ethereum/typedData';

const fixtures = commonFixtures.tests.flatMap(({ name, parameters, result }) => {
    const fixture = {
        setup: {
            firmware: [['2.4.2', '2-master']],
        },
        description: `${name} ${parameters.comment ?? ''}`,
        name,
        params: parameters,
        result: {
            address: result.address,
            signature: result.sig,
        },
    };
    return fixture;
});

// const t1Fixtures = fixtures.map(f => {
//     const fixture = {
//         ...f,
//         description: `t1: ${f.description}`,
//         setup: {
//             ...f.setup,
//             firmware: [['1.10.6', '1-master']],
//         },
//         params: {
//             ...f.params,
//             ...transformTypedData(f.params.data, true),
//         },
//     };

//     if (!f.params.metamask_v4_compat) {
//         fixture.result = false;
//     }
//     return fixture;
// });

export default {
    method: 'ethereumSignTypedData',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    // tests: [...fixtures, ...t1Fixtures],
    tests: [...fixtures],
};
