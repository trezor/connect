/* @flow */
'use strict';

import type { MessageResponse, DefaultMessageResponse } from '../../../device/DeviceCommands';
import type {
    Transaction as $TezosTransaction,
} from '../../../types/tezos';

import type {
    TezosSignedTx,
    TezosTransaction
} from '../../../types/trezor';


export const tezosSignTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    address_n: Array<number>,
    tx: $TezosTransaction,
): Promise<TezosSignedTx> => {

    // TODO: fill this message with data transformed from "./types/tezos.js#Transaction" where fields should be in "snakeCase"
    // to  "./types/trezor.js#TezosTransaction" where fields should corresponding with protobuf expected fields
    const message: TezosTransaction = {
        address_n: [0, 0, 0],
        curve: 1,
        branch: "branch",
        reveal: {
            // source?: TezosContractID,
            // fee?: number,
            // counter?: number,
            // gas_limit?: number,
            // storage_limit?: number,
            // public_key?: string,
        },
        transaction: null,
        origination: null,
        delegation: null
    };

    // TODO: the code below is not valid, there will be probably some loop with message exchange until device will return "TezosSignedTx"
    // see: ./js/core/methods/helpers/stellarSignTx.js for example
    const response: MessageResponse<TezosSignedTx> = await typedCall('TezosSignTx', 'TezosSignedTx', message);
    return response.message;
};
