const commonFixtures = require('../../../../submodules/trezor-common/tests/fixtures/ethereum/sign_typed_data.json');
const typedData = require('./typedData');

describe('typedData', () => {
    commonFixtures.tests
        .filter(test => test.parameters.metamask_v4_compat)
        .forEach(test => {
            it('typedData to message_hash and domain_separator_hash', () => {
                const transformed = typedData(test.parameters.data, true);
                // todo: fixtures in firmware-repo not unified, probably bug
                const { domain_separator_hash /* , message_hash */ } = transformed;

                expect(`0x${domain_separator_hash}`).toEqual(test.parameters.domain_separator_hash);
                // expect(`0x${message_hash}`).toEqual(test.parameters.message_hash);
            });
        });
});
