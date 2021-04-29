/* @flow */
import { addressParametersToProto, validateAddressParameters } from './cardanoAddressParameters';
import { validateParams } from './paramsValidator';
import { validatePath } from '../../../utils/pathUtils';

import type {
    CardanoTxAuxiliaryDataType,
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
): CardanoTxAuxiliaryDataType => {
    validateParams(auxiliaryData, [
        {
            name: 'blob',
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
        blob: auxiliaryData.blob,
        catalyst_registration_parameters: catalystRegistrationParameters,
    };
};
