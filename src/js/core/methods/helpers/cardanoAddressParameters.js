/* @flow */
import { validateParams } from '../helpers/paramsValidator';
import { validatePath } from '../../../utils/pathUtils';

import type { CardanoAddressParameters as CardanoAddressParametersProto } from '../../../types/trezor/protobuf';
import type { CardanoAddressParameters } from '../../../types/networks/cardano';

export const validateAddressParameters = (addressParameters: CardanoAddressParameters) => {
    validateParams(addressParameters, [
        { name: 'addressType', type: 'number', obligatory: true },
        { name: 'path', type: 'string', obligatory: true },
        { name: 'stakingPath', type: 'string' },
        { name: 'stakingKeyHash', type: 'string' },
    ]);
    if (addressParameters.certificatePointer) {
        validateParams(addressParameters.certificatePointer, [
            { name: 'blockIndex', type: 'number', obligatory: true },
            { name: 'txIndex', type: 'number', obligatory: true },
            { name: 'certificateIndex', type: 'number', obligatory: true },
        ]);
    }
};

export const addressParametersToProto = (addressParameters: CardanoAddressParameters): CardanoAddressParametersProto => {
    const path = validatePath(addressParameters.path, 3);

    let stakingPath = [];
    if (addressParameters.stakingPath) {
        stakingPath = validatePath(addressParameters.stakingPath, 3);
    }

    let certificatePointer;
    if (addressParameters.certificatePointer) {
        certificatePointer = {
            block_index: addressParameters.certificatePointer.blockIndex,
            tx_index: addressParameters.certificatePointer.txIndex,
            certificate_index: addressParameters.certificatePointer.certificateIndex,
        };
    }

    return {
        address_type: addressParameters.addressType,
        address_n: path,
        address_n_staking: stakingPath,
        staking_key_hash: addressParameters.stakingKeyHash,
        certificate_pointer: certificatePointer,
    };
};
