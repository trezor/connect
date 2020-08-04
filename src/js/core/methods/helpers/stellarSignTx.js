/* @flow */

import { validateParams } from './paramsValidator';

import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';
import type {
    StellarTransaction,
    StellarOperation,
} from '../../../types/networks/stellar';

import type {
    StellarSignedTx,
    StellarSignTxMessage,
    StellarOperationMessage,
} from '../../../types/trezor/protobuf';

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    operations: Array<StellarOperationMessage>,
    index: number
): Promise<StellarSignedTx> => {
    const lastOp: boolean = (index + 1 >= operations.length);
    const op = operations[index];
    const type: string = op.type;

    if (lastOp) {
        const response: MessageResponse<StellarSignedTx> = await typedCall(type, 'StellarSignedTx', {
            ...op,
            type: null, // 'type' is not a protobuf field and needs to be removed
        });
        return response.message;
    } else {
        await typedCall(type, 'StellarTxOpRequest', {
            ...op,
            type: null, // 'type' is not a protobuf field and needs to be removed
        });
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
    tx: StellarTransaction,
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
const transformSignMessage = (tx: StellarTransaction): StellarSignTxMessage => {
    const options: $Shape<StellarSignTxMessage> = {};
    // timebounds_start and timebounds_end are the only fields which needs to be converted to number
    if (tx.timebounds) {
        options.timebounds_start = tx.timebounds.minTime;
        options.timebounds_end = tx.timebounds.maxTime;
    }

    if (tx.memo) {
        options.memo_type = tx.memo.type;
        options.memo_text = tx.memo.text;
        options.memo_id = tx.memo.id;
        options.memo_hash = tx.memo.hash;
    }

    return {
        address_n: [], // will be overridden
        network_passphrase: '', // will be overridden
        source_account: tx.source,
        fee: tx.fee,
        sequence_number: tx.sequence,
        num_operations: tx.operations.length,
        ...options,
    };
};

// transform incoming parameters to protobuf messages format
const transformOperation = (op: StellarOperation): ?StellarOperationMessage => {
    switch (op.type) {
        case 'createAccount' :
            validateParams(op, [
                { name: 'destination', type: 'string', obligatory: true },
                { name: 'startingBalance', type: 'amount', obligatory: true },
            ]);
            return {
                type: 'StellarCreateAccountOp',
                source_account: op.source,
                new_account: op.destination,
                starting_balance: op.startingBalance,
            };

        case 'payment' :
            validateParams(op, [
                { name: 'destination', type: 'string', obligatory: true },
                { name: 'amount', type: 'amount', obligatory: true },
            ]);
            return {
                type: 'StellarPaymentOp',
                source_account: op.source,
                destination_account: op.destination,
                asset: op.asset,
                amount: op.amount,
            };

        case 'pathPayment' :
            validateParams(op, [{ name: 'destAmount', type: 'amount', obligatory: true }]);
            return {
                type: 'StellarPathPaymentOp',
                source_account: op.source,
                send_asset: op.sendAsset,
                send_max: op.sendMax,
                destination_account: op.destination,
                destination_asset: op.destAsset,
                destination_amount: op.destAmount,
                paths: op.path,
            };

        case 'createPassiveOffer' :
            validateParams(op, [{ name: 'amount', type: 'amount', obligatory: true }]);
            return {
                type: 'StellarCreatePassiveOfferOp',
                source_account: op.source,
                buying_asset: op.buying,
                selling_asset: op.selling,
                amount: op.amount,
                price_n: op.price.n,
                price_d: op.price.d,
            };

        case 'manageOffer' :
            validateParams(op, [{ name: 'amount', type: 'amount', obligatory: true }]);
            return {
                type: 'StellarManageOfferOp',
                source_account: op.source,
                buying_asset: op.buying,
                selling_asset: op.selling,
                amount: op.amount,
                offer_id: op.offerId,
                price_n: op.price.n,
                price_d: op.price.d,
            };

        case 'setOptions' : {
            const signer = op.signer ? {
                signer_type: op.signer.type,
                signer_key: op.signer.key,
                signer_weight: op.signer.weight,
            } : undefined;
            return {
                type: 'StellarSetOptionsOp',
                source_account: op.source,
                clear_flags: op.clearFlags,
                set_flags: op.setFlags,
                master_weight: op.masterWeight,
                low_threshold: op.lowThreshold,
                medium_threshold: op.medThreshold,
                high_threshold: op.highThreshold,
                home_domain: op.homeDomain,
                inflation_destination_account: op.inflationDest,
                ...signer,
            };
        }

        case 'changeTrust' :
            validateParams(op, [{ name: 'limit', type: 'amount' }]);
            return {
                type: 'StellarChangeTrustOp',
                source_account: op.source,
                asset: op.line,
                limit: op.limit,
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
                bump_to: op.bumpTo,
            };
    }
};

