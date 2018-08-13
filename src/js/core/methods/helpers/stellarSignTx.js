/* @flow */
'use strict';

import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';
import type {
    Transaction as $StellarTransaction,
    Operation as $StellarOperation,
} from '../../../types/stellar';

import type {
    StellarSignedTx,
    StellarSignTxMessage,
    StellarOperationMessage,
} from '../../../types/trezor';

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    operations: Array<StellarOperationMessage>,
    index: number
): Promise<StellarSignedTx> => {
    const lastOp: boolean = (index + 1 >= operations.length);
    const op = operations[index];
    const type: string = op.type;
    delete op.type;

    if (lastOp) {
        const response: MessageResponse<StellarSignedTx> = await typedCall(type, 'StellarSignedTx', op);
        return response.message;
    } else {
        await typedCall(type, 'StellarPaymentOp', op);
    }

    return await processTxRequest(
        typedCall,
        operations,
        index + 1
    );
};

export const stellarSignTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    address_n: Array<number>,
    networkPassphrase: string,
    tx: $StellarTransaction,
): Promise<StellarSignedTx> => {
    // eslint-disable-next-line no-use-before-define
    const message: StellarSignTxMessage = transformSignMessage(tx);
    message.address_n = address_n;
    message.network_passphrase = networkPassphrase;

    const operations: Array<StellarOperationMessage> = [];
    tx.operations.forEach(op => {
        // eslint-disable-next-line no-use-before-define
        const transformed: ?StellarOperationMessage = transformOperation(op);
        if (transformed) { operations.push(transformed); }
    });

    await typedCall('StellarSignTx', 'StellarTxOpRequest', message);

    return await processTxRequest(typedCall, operations, 0);
};

// transform incoming parameters to protobuf messages format
const transformSignMessage = (tx: $StellarTransaction): StellarSignTxMessage => {
    const timebounds = tx.timebounds ? {
        timebounds_start: tx.timebounds.minTime,
        timebounds_end: tx.timebounds.maxTime,
    } : null;

    const memo = tx.memo ? {
        memo_type: tx.memo.type,
        memo_text: tx.memo.text,
        memo_id: tx.memo.id,
        memo_hash: tx.memo.hash,
    } : null;

    return {
        address_n: [], // will be overridden
        network_passphrase: '', // will be overridden
        source_account: tx.source,
        fee: tx.fee,
        sequence_number: tx.sequence,
        ...timebounds,
        ...memo,
        num_operations: tx.operations.length,
    };
};

// transform incoming parameters to protobuf messages format
const transformOperation = (op: $StellarOperation): ?StellarOperationMessage => {
    switch (op.type) {
        case 'createAccount' :
            return {
                type: 'StellarCreateAccountOp',
                new_account: op.destination,
                source_account: op.source,
                starting_balance: parseFloat(op.startingBalance),
            };

        case 'payment' :
            return {
                type: 'StellarPaymentOp',
                source_account: op.source,
                destination_account: op.destination,
                asset: op.asset,
                amount: parseFloat(op.amount),
            };

        case 'pathPayment' :
            return {
                type: 'StellarPathPaymentOp',
                source_account: op.source,
                send_asset: op.sendAsset,
                send_max: op.sendMax,
                destination_account: op.destination,
                destination_asset: op.destAsset,
                destination_amount: parseFloat(op.destAmount),
                paths: op.path,
            };

        case 'manageOffer' :
            return {
                type: 'StellarManageOfferOp',
                source_account: op.source,
                offer_id: op.offerId,
                amount: parseFloat(op.amount),
                buying_asset: op.buying,
                selling_asset: op.selling,
                price_n: op.price.n,
                price_d: op.price.d,
            };

        case 'createPassiveOffer' :
            return {
                type: 'StellarCreatePassiveOfferOp',
                source_account: op.source,
                offer_id: op.offerId,
                amount: parseFloat(op.amount),
                buying_asset: op.buying,
                selling_asset: op.selling,
                price_n: op.price.n,
                price_d: op.price.d,
            };

        case 'setOptions' :
            return {
                type: 'StellarSetOptionsOp',
                source_account: op.source,
                signer_type: op.signer.type,
                signer_key: op.signer.key,
                signer_weight: op.signer.weight,
                clear_flags: op.clearFlags,
                set_flags: op.setFlags,
                master_weight: op.masterWeight,
                low_threshold: op.lowThreshold,
                medium_threshold: op.medThreshold,
                high_threshold: op.highThreshold,
                home_domain: op.homeDomain,
                inflation_destination_account: op.inflationDest,
            };

        case 'changeTrust' :
            return {
                type: 'StellarChangeTrustOp',
                source_account: op.source,
                asset: op.line,
                limit: parseFloat(op.limit),
            };

        case 'allowTrust' :
            return {
                type: 'StellarAllowTrustOp',
                source_account: op.source,
                trusted_account: op.trustor,
                asset_type: op.assetType,
                asset_code: op.assetCode,
                is_authorized: op.authorize ? 1 : 0,
            };

        case 'accountMerge' :
            return {
                type: 'StellarAccountMergeOp',
                source_account: op.source,
                destination_account: op.destination,
            };

        case 'manageData' :
            return {
                type: 'StellarManageDataOp',
                source_account: op.source,
                key: op.name,
                value: op.value,
            };

        case 'bumpSequence' :
            return {
                type: 'StellarBumpSequenceOp',
                source_account: op.source,
                bump_to: op.to,
            };
    }
};

