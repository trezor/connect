/* @flow */
import { validateParams } from './paramsValidator';

import type {
    CardanoToken as CardanoTokenProto,
    CardanoTxOutput,
} from '../../../types/trezor/protobuf';
import type { CardanoAssetGroup, CardanoToken } from '../../../types/networks/cardano';
import { addressParametersToProto, validateAddressParameters } from './cardanoAddressParameters';

type AssetGroupWithTokens = {
    policyId: string,
    tokens: CardanoTokenProto[],
};

export type OutputWithTokens = {
    output: CardanoTxOutput,
    tokenBundle?: AssetGroupWithTokens[],
};

const validateTokens = (tokenAmounts: CardanoToken[]) => {
    tokenAmounts.forEach(tokenAmount => {
        validateParams(tokenAmount, [
            { name: 'assetNameBytes', type: 'string', obligatory: true },
            { name: 'amount', type: 'amount', obligatory: true },
        ]);
    });
};

const validateTokenBundle = (tokenBundle: CardanoAssetGroup[]) => {
    tokenBundle.forEach(tokenGroup => {
        validateParams(tokenGroup, [
            { name: 'policyId', type: 'string', obligatory: true },
            { name: 'tokenAmounts', type: 'array', obligatory: true },
        ]);

        validateTokens(tokenGroup.tokenAmounts);
    });
};

const tokenAmountsToProto = (tokenAmounts: CardanoToken[]): CardanoTokenProto[] =>
    tokenAmounts.map(tokenAmount => ({
        asset_name_bytes: tokenAmount.assetNameBytes,
        amount: tokenAmount.amount,
    }));

const tokenBundleToProto = (tokenBundle: CardanoAssetGroup[]): AssetGroupWithTokens[] =>
    tokenBundle.map(tokenGroup => ({
        policyId: tokenGroup.policyId,
        tokens: tokenAmountsToProto(tokenGroup.tokenAmounts),
    }));

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
