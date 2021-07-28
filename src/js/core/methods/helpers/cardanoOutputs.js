/* @flow */
import { validateParams } from './paramsValidator';

import type { CardanoTxOutput } from '../../../types/trezor/protobuf';
import { addressParametersToProto, validateAddressParameters } from './cardanoAddressParameters';
import type { AssetGroupWithTokens } from './cardanoTokenBundle';
import { tokenBundleToProto, validateTokenBundle } from './cardanoTokenBundle';

export type OutputWithTokens = {
    output: CardanoTxOutput,
    tokenBundle?: AssetGroupWithTokens[],
};

export const transformOutput = (output: any) => {
    validateParams(output, [
        { name: 'address', type: 'string' },
        { name: 'amount', type: 'amount', obligatory: true },
        { name: 'tokenBundle', type: 'array', allowEmpty: true },
    ]);

    const result: OutputWithTokens = {
        output: {
            amount: output.amount,
            asset_groups_count: 0,
        },
    };

    if (output.addressParameters) {
        validateAddressParameters(output.addressParameters);
        result.output.address_parameters = addressParametersToProto(output.addressParameters);
    } else {
        result.output.address = output.address;
    }

    if (output.tokenBundle) {
        validateTokenBundle(output.tokenBundle);
        result.tokenBundle = tokenBundleToProto(output.tokenBundle);
        result.output.asset_groups_count = result.tokenBundle.length;
    } else {
        result.output.asset_groups_count = 0;
    }

    return result;
};
