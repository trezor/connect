/* @flow */
'use strict';

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
    if (request.tx_index === null || request.tx_index === undefined) {
        return request;
    }

    const transaction: string = transactions[request.tx_index];
    const response: MessageResponse<CardanoTxRequest> = await typedCall('CardanoTxAck', 'CardanoTxRequest', { transaction });

    return processTxRequest(typedCall, response.message, transactions);
};

export const cardanoSignTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    inputs: Array<CardanoTxInput>,
    outputs: Array<CardanoTxOutput>,
    transactions: Array<string>,
): Promise<CardanoSignedTx> => {
    const response: MessageResponse<CardanoTxRequest> = await typedCall('CardanoSignTransaction', 'CardanoTxRequest', {
        inputs: inputs,
        outputs: outputs,
        transactions_count: transactions.length,
    });

    return await processTxRequest(typedCall, response.message, transactions);
};
