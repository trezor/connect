/* @flow */
import { validateParams } from './paramsValidator';

import type { CardanoToken as CardanoTokenProto } from '../../../types/trezor/protobuf';
import type { CardanoAssetGroup, CardanoToken } from '../../../types/networks/cardano';

export type AssetGroupWithTokens = {
    policyId: string,
    tokens: CardanoTokenProto[],
};

const validateTokens = (tokenAmounts: CardanoToken[]) => {
    tokenAmounts.forEach(tokenAmount => {
        validateParams(tokenAmount, [
            { name: 'assetNameBytes', type: 'string', required: true },
            { name: 'amount', type: 'uint' },
            { name: 'mintAmount', type: 'uint', allowNegative: true },
        ]);
    });
};

const validateTokenBundle = (tokenBundle: CardanoAssetGroup[]) => {
    tokenBundle.forEach(tokenGroup => {
        validateParams(tokenGroup, [
            { name: 'policyId', type: 'string', required: true },
            { name: 'tokenAmounts', type: 'array', required: true },
        ]);

        validateTokens(tokenGroup.tokenAmounts);
    });
};

const tokenAmountsToProto = (tokenAmounts: CardanoToken[]): CardanoTokenProto[] =>
    tokenAmounts.map(tokenAmount => ({
        asset_name_bytes: tokenAmount.assetNameBytes,
        amount: tokenAmount.amount,
        mint_amount: tokenAmount.mintAmount,
    }));

export const tokenBundleToProto = (tokenBundle: CardanoAssetGroup[]): AssetGroupWithTokens[] => {
    validateTokenBundle(tokenBundle);
    return tokenBundle.map(tokenGroup => ({
        policyId: tokenGroup.policyId,
        tokens: tokenAmountsToProto(tokenGroup.tokenAmounts),
    }));
};
