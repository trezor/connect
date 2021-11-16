import commonFixtures from '../../submodules/trezor-common/tests/fixtures/cardano/get_base_address.derivations.json';
import {
    Enum_CardanoAddressType as CardanoAddressType,
    Enum_CardanoDerivationType as CardanoDerivationType,
} from '../../src/js/types/trezor/protobuf';

export default {
    method: 'cardanoGetAddress',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
        // mnemonic: 'mnemonic_all',
    },
    tests: [commonFixtures.tests[0]].flatMap(({ name, parameters, result }) => {
        const fixture = {
            description: name,
            params: {
                addressParameters: {
                    addressType: CardanoAddressType[parameters.address_type.toUpperCase()],
                    path: parameters.path,
                    stakingPath: parameters.staking_path,
                },
                derivationType: CardanoDerivationType[parameters.derivation_type],
                networkId: parameters.network_id,
                protocolMagic: parameters.protocol_magic,
            },
            result: {
                address: result.expected_address,
            },
        };

        console.log(fixture);

        return fixture;
    }),
};
