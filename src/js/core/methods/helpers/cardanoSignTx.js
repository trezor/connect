/* @flow */

import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';
import type {
    CardanoTxRequest,
    CardanoSignedTx,
    CardanoTxInput,
    CardanoTxOutput,
} from '../../../types/trezor';

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    request: CardanoTxRequest,
    transactions: Array<string>
): Promise<CardanoSignedTx> => {
    const transaction: string = transactions[request.tx_index];
    if (request.tx_index < transactions.length - 1) {
        const response: MessageResponse<CardanoTxRequest> = await typedCall('CardanoTxAck', 'CardanoTxRequest', { transaction });
        return processTxRequest(typedCall, response.message, transactions);
    } else {
        const response: MessageResponse<CardanoSignedTx> = await typedCall('CardanoTxAck', 'CardanoSignedTx', { transaction });
        return response.message;
    }
};

export const cardanoSignTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    inputs: Array<CardanoTxInput>,
    outputs: Array<CardanoTxOutput>,
    transactions: Array<string>,
    protocol_magic: number,
): Promise<CardanoSignedTx> => {
    const response: MessageResponse<CardanoTxRequest> = await typedCall('CardanoSignTx', 'CardanoTxRequest', {
        inputs: inputs,
        outputs: outputs,
        transactions_count: transactions.length,
        protocol_magic: protocol_magic,
    });
    return await processTxRequest(typedCall, response.message, transactions);
};
