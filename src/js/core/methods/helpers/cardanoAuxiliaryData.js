/* @flow */
import { addressParametersToProto, validateAddressParameters } from './cardanoAddressParameters';
import { validateParams } from './paramsValidator';
import { validatePath } from '../../../utils/pathUtils';

import type {
    CardanoTxAuxiliaryData,
    CardanoCatalystRegistrationParametersType,
} from '../../../types/trezor/protobuf';
import type {
    CardanoAuxiliaryData,
    CardanoCatalystRegistrationParameters,
} from '../../../types/networks/cardano';

const transformCatalystRegistrationParameters = (
    catalystRegistrationParameters: CardanoCatalystRegistrationParameters,
): CardanoCatalystRegistrationParametersType => {
    validateParams(catalystRegistrationParameters, [
        { name: 'votingPublicKey', type: 'string', obligatory: true },
        { name: 'stakingPath', obligatory: true },
        { name: 'nonce', type: 'amount', obligatory: true },
    ]);
    validateAddressParameters(catalystRegistrationParameters.rewardAddressParameters);

    return {
        voting_public_key: catalystRegistrationParameters.votingPublicKey,
        staking_path: validatePath(catalystRegistrationParameters.stakingPath, 3),
        reward_address_parameters: addressParametersToProto(
            catalystRegistrationParameters.rewardAddressParameters,
        ),
        nonce: catalystRegistrationParameters.nonce,
    };
};

export const transformAuxiliaryData = (
    auxiliaryData: CardanoAuxiliaryData,
): CardanoTxAuxiliaryData => {
    validateParams(auxiliaryData, [
        {
            name: 'hash',
            type: 'string',
        },
    ]);

    let catalystRegistrationParameters;
    if (auxiliaryData.catalystRegistrationParameters) {
        catalystRegistrationParameters = transformCatalystRegistrationParameters(
            auxiliaryData.catalystRegistrationParameters,
        );
    }

    return {
        hash: auxiliaryData.hash,
        catalyst_registration_parameters: catalystRegistrationParameters,
    };
};
