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
            { name: 'assetNameBytes', type: 'string', obligatory: true },
            { name: 'amount', type: 'amount' },
            { name: 'mintAmount', type: 'amount' },
        ]);
    });
};

export const validateTokenBundle = (tokenBundle: CardanoAssetGroup[]) => {
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
        mint_amount: tokenAmount.mintAmount,
    }));

export const tokenBundleToProto = (tokenBundle: CardanoAssetGroup[]): AssetGroupWithTokens[] =>
    tokenBundle.map(tokenGroup => ({
        policyId: tokenGroup.policyId,
        tokens: tokenAmountsToProto(tokenGroup.tokenAmounts),
    }));
