/* @flow */
'use strict';

import { reverseBuffer } from '../../../utils/bufferUtils';
import { isSegwitPath } from '../../../utils/pathUtils';
import { isValidAddress } from '../../../utils/addressUtils';

import type {
    BuildTxOutputRequest,
    BuildTxInput,
    BuildTxOutput
} from 'hd-wallet';

import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction
} from '../../../types/trezor';

import type { CoinInfo } from 'flowtype';

// transform from TREZOR format to hd-wallet
export const input = (input: TransactionInput, sequence: number): BuildTxInput => {
    let segwit = isSegwitPath(input.address_n);
    if (segwit) {
        if (!input.amount) throw new Error('Input amount not set');
        if (!input.script_type) throw new Error('Input script_type not set');
        // if (input.script_type !== 'SPENDP2SHWITNESS') throw new Error('Input script_type should be set to SPENDP2SHWITNESS');
    }

    return {
        hash: reverseBuffer(new Buffer(input.prev_hash, 'hex')),
        index: input.prev_index,
        path: input.address_n,
        amount: input.amount,
        segwit: segwit
    };
}

// validate
export const validateOutput = (output: BuildTxOutputRequest, coinInfo: CoinInfo): BuildTxOutputRequest => {

    if (output.hasOwnProperty('address') && typeof output.address === 'string') {
        if (!isValidAddress(output.address, coinInfo)) {
            throw new Error(`Invalid ${ coinInfo.label } output address format`);
        }
    }

    if (typeof output.type === 'string') {

        switch (output.type) {
            case 'opreturn' :
                if (typeof output.dataHex !== 'string')
                    throw new Error('Invalid dataHex in opreturn output');
            break;

            case 'send-max' :
                if (typeof output.address !== 'string')
                    throw new Error('Invalid address in send-max output');
            break;

            case 'noaddress' :
                if (typeof output.amount !== 'number')
                    throw new Error('Invalid amount in noaddress output');
            break;
        }

        return output;

    } else {

        if (typeof output.address !== 'string')
            throw new Error('Invalid address in output');

        if (typeof output.amount !== 'number')
            throw new Error('Invalid amount in output');

            if (output.address) {

            }

        return {
            type: 'complete',
            address: output.address,
            amount: output.amount
        }
    }


}
