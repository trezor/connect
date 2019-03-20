/* @flow */
'use strict';

import { validateParams } from './paramsValidator';

import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';
import type {
    Transaction as $KinTransaction,
    Operation as $KinOperation,
} from '../../../types/kin';

import type {
    KinSignedTx,
    KinSignTxMessage,
    KinOperationMessage,
} from '../../../types/trezor';

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    operations: Array<KinOperationMessage>,
    index: number
): Promise<KinSignedTx> => {
    const lastOp: boolean = (index + 1 >= operations.length);
    const op = operations[index];
    const type: string = op.type;
    delete op.type;

    if (lastOp) {
        const response: MessageResponse<KinSignedTx> = await typedCall(type, 'KinSignedTx', op);
        return response.message;
    } else {
        await typedCall(type, 'KinTxOpRequest', op);
    }

    return await processTxRequest(
        typedCall,
        operations,
        index + 1
    );
};

export const kinSignTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    address_n: Array<number>,
    networkPassphrase: string,
    tx: $KinTransaction,
): Promise<KinSignedTx> => {
    // eslint-disable-next-line no-use-before-define
    const message: KinSignTxMessage = transformSignMessage(tx);
    message.address_n = address_n;
    message.network_passphrase = networkPassphrase;

    const operations: Array<KinOperationMessage> = [];
    tx.operations.forEach(op => {
        // eslint-disable-next-line no-use-before-define
        const transformed: ?KinOperationMessage = transformOperation(op);
        if (transformed) { operations.push(transformed); }
    });

    await typedCall('KinSignTx', 'KinTxOpRequest', message);

    return await processTxRequest(typedCall, operations, 0);
};

// transform incoming parameters to protobuf messages format
const transformSignMessage = (tx: $KinTransaction): KinSignTxMessage => {
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
const transformOperation = (op: $KinOperation): ?KinOperationMessage => {
    switch (op.type) {
        case 'createAccount' :
            validateParams(op, [{ name: 'startingBalance', type: 'amount' }]);
            return {
                type: 'KinCreateAccountOp',
                new_account: op.destination,
                source_account: op.source,
                starting_balance: parseInt(op.startingBalance, 10),
            };

        case 'payment' :
            validateParams(op, [{ name: 'amount', type: 'amount' }]);
            return {
                type: 'KinPaymentOp',
                source_account: op.source,
                destination_account: op.destination,
                asset: op.asset,
                amount: parseInt(op.amount, 10),
            };

        case 'pathPayment' :
            validateParams(op, [{ name: 'destAmount', type: 'amount' }]);
            return {
                type: 'KinPathPaymentOp',
                source_account: op.source,
                send_asset: op.sendAsset,
                send_max: op.sendMax,
                destination_account: op.destination,
                destination_asset: op.destAsset,
                destination_amount: parseInt(op.destAmount, 10),
                paths: op.path,
            };

        case 'manageOffer' :
            validateParams(op, [{ name: 'amount', type: 'amount' }]);
            return {
                type: 'KinManageOfferOp',
                source_account: op.source,
                offer_id: op.offerId,
                amount: parseInt(op.amount, 10),
                buying_asset: op.buying,
                selling_asset: op.selling,
                price_n: op.price.n,
                price_d: op.price.d,
            };

        case 'createPassiveOffer' :
            validateParams(op, [{ name: 'amount', type: 'amount' }]);
            return {
                type: 'KinCreatePassiveOfferOp',
                source_account: op.source,
                offer_id: op.offerId,
                amount: parseInt(op.amount, 10),
                buying_asset: op.buying,
                selling_asset: op.selling,
                price_n: op.price.n,
                price_d: op.price.d,
            };

        case 'setOptions' :
            validateParams(op, [{ name: 'signer', type: 'object' }]);
            if (!op.signer) op.signer = {};
            return {
                type: 'KinSetOptionsOp',
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
            validateParams(op, [{ name: 'limit', type: 'amount' }]);
            return {
                type: 'KinChangeTrustOp',
                source_account: op.source,
                asset: op.line,
                limit: parseInt(op.limit, 10),
            };

        case 'allowTrust' :
            return {
                type: 'KinAllowTrustOp',
                source_account: op.source,
                trusted_account: op.trustor,
                asset_type: op.assetType,
                asset_code: op.assetCode,
                is_authorized: op.authorize ? 1 : 0,
            };

        case 'accountMerge' :
            return {
                type: 'KinAccountMergeOp',
                source_account: op.source,
                destination_account: op.destination,
            };

        case 'manageData' :
            return {
                type: 'KinManageDataOp',
                source_account: op.source,
                key: op.name,
                value: op.value,
            };

        case 'bumpSequence' :
            return {
                type: 'KinBumpSequenceOp',
                source_account: op.source,
                bump_to: op.to,
            };
    }
};

