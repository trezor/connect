/* @flow */

import { invalidParameter } from '../../../constants/errors';
import { validateParams } from './paramsValidator';
import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';
import type {
    BinanceTxRequest,
    BinanceSignedTx,
} from '../../../types/trezor';
import type {
    BinanceTransaction,
    PreparedBinanceTransaction,
} from '../../../types/binance';

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    response: MessageResponse<BinanceTxRequest>,
    messages: $ElementType<PreparedBinanceTransaction, 'messages'>,
    index: number,
): Promise<BinanceSignedTx> => {
    const msg = messages[index];
    const type = msg.type;
    delete msg.type; // 'type' is not a protobuf field and needs to be removed
    const lastOp = (index + 1 >= messages.length);

    if (lastOp) {
        const response: MessageResponse<BinanceSignedTx> = await typedCall(type, 'BinanceSignedTx', msg);
        return response.message;
    }
    const ack: MessageResponse<BinanceTxRequest> = await typedCall(type, 'BinanceTxRequest', msg);
    index++;

    return await processTxRequest(
        typedCall,
        ack,
        messages,
        index
    );
};

// validate and translate params to protobuf
export const validate = (tx: BinanceTransaction): PreparedBinanceTransaction => {
    validateParams(tx, [
        { name: 'chain_id', type: 'string', obligatory: true },
        { name: 'account_number', type: 'number' },
        { name: 'memo', type: 'string' },
        { name: 'sequence', type: 'number' },
        { name: 'source', type: 'number' },
        { name: 'message', type: 'object' },
    ]);

    const preparedTx: PreparedBinanceTransaction = {
        chain_id: tx.chain_id,
        account_number: tx.account_number || 0,
        memo: tx.memo,
        sequence: tx.sequence || 0,
        source: tx.source || 0,
        messages: [],
    };

    if (tx.transfer) {
        validateParams(tx.transfer, [
            { name: 'inputs', type: 'array', obligatory: true },
            { name: 'outputs', type: 'array', obligatory: true },
        ]);
        preparedTx.messages.push({
            ...tx.transfer,
            type: 'BinanceTransferMsg',
        });
    }

    if (tx.placeOrder) {
        validateParams(tx.placeOrder, [
            { name: 'id', type: 'string' },
            { name: 'ordertype', type: 'number' },
            { name: 'price', type: 'number' },
            { name: 'quantity', type: 'number' },
            { name: 'sender', type: 'string' },
            { name: 'side', type: 'number' },
        ]);
        preparedTx.messages.push({
            type: 'BinanceOrderMsg',
            ...tx.placeOrder,
        });
    }

    if (tx.cancelOrder) {
        validateParams(tx.cancelOrder, [
            { name: 'refid', type: 'string', obligatory: true },
            { name: 'sender', type: 'string', obligatory: true },
            { name: 'symbol', type: 'string', obligatory: true },
        ]);
        preparedTx.messages.push({
            type: 'BinanceCancelMsg',
            ...tx.cancelOrder,
        });
    }

    if (preparedTx.messages.length < 1) {
        throw invalidParameter('Transaction does not have any message');
    }

    return preparedTx;
};

export const signTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    address_n: number[],
    tx: PreparedBinanceTransaction,
): Promise<BinanceSignedTx> => {
    const {
        account_number,
        chain_id,
        memo,
        sequence,
        source,
        messages,
    } = tx;
    const msg_count = messages.length;

    const response = await typedCall('BinanceSignTx', 'BinanceTxRequest', {
        address_n,
        msg_count,
        account_number,
        chain_id,
        memo,
        sequence,
        source,
    });
    return await processTxRequest(typedCall, response, messages, 0);
};
