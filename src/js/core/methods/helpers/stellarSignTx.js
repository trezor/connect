/* @flow */
'use strict';

import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    operations: Array<any>,
    index: number
): Promise<any> => {

    const lastOp: boolean = (index + 1 >= operations.length);
    const op = operations[index];

    const response: DefaultMessageResponse = await typedCall(op.type, lastOp ? 'StellarSignedTx' : 'StellarPaymentOp', op.params);

    if (lastOp) {
        return response;
    }

    return await processTxRequest(
        typedCall,
        operations,
        index + 1
    );
};

export const stellarSignTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    address_n: Array<number>,
    tx: any,
): Promise<any> => {

    const operations = tx.operations;

    delete tx.operations;
    tx.address_n = address_n;
    tx.num_operations = operations.length;

    const response: DefaultMessageResponse = await typedCall('StellarSignTx', 'StellarTxOpRequest', tx);

    return await processTxRequest(typedCall, operations, 0);
};
