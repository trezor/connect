/* @flow */
import { validateParams } from './paramsValidator';

import type { CardanoAssetGroupType, CardanoTokenType } from '../../../types/trezor/protobuf';
import type { CardanoAssetGroup, CardanoToken } from '../../../types/networks/cardano';

const validateTokens = (tokenAmounts: CardanoToken[]) => {
    tokenAmounts.forEach(tokenAmount => {
        validateParams(tokenAmount, [
            { name: 'assetNameBytes', type: 'string', obligatory: true },
            { name: 'amount', type: 'amount', obligatory: true },
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

const tokenAmountsToProto = (tokenAmounts: CardanoToken[]): CardanoTokenType[] =>
    tokenAmounts.map(tokenAmount => ({
        asset_name_bytes: tokenAmount.assetNameBytes,
        amount: tokenAmount.amount,
    }));

export const tokenBundleToProto = (tokenBundle: CardanoAssetGroup[]): CardanoAssetGroupType[] =>
    tokenBundle.map(tokenGroup => ({
        policy_id: tokenGroup.policyId,
        tokens: tokenAmountsToProto(tokenGroup.tokenAmounts),
    }));
