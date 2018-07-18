/* @flow */
'use strict';

import { reverseBuffer } from '../../../utils/bufferUtils';
import { isSegwitPath } from '../../../utils/pathUtils';
import { isValidAddress } from '../../../utils/addressUtils';
import { validateParams } from '../helpers/paramsValidator';

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

    // if (output.hasOwnProperty('address') && typeof output.address === 'string') {
    //     if (!isValidAddress(output.address, coinInfo)) {
    //         throw new Error(`Invalid ${ coinInfo.label } output address format`);
    //     }
    // }

    const validateAddress = (address) => {
        if (!isValidAddress(address, coinInfo)) {
            throw new Error(`Invalid ${ coinInfo.label } output address format`);
        }
    }

    switch (output) {
        case 'opreturn' :
            validateParams(output, [ { name: 'dataHex', type: 'string', obligatory: true }]);
            return {
                type: 'opreturn',
                dataHex: output.dataHex
            }

        case 'send-max' :
            validateParams(output, [ { name: 'address', type: 'string', obligatory: true }]);
            validateAddress(output.address);
            return {
                type: 'send-max',
                address: output.address
            }

        case 'noaddress' :
            validateParams(output, [ { name: 'amount', type: 'string', obligatory: true }]);
            return {
                type: 'noaddress',
                amount: parseInt(output.amount)
            }
        case 'send-max-noaddress' :
            return {
                type: 'send-max-noaddress'
            }

        default :
        case 'complete' :
            validateParams(output, [
                { name: 'amount', type: 'string', obligatory: true },
                { name: 'address', type: 'string', obligatory: true }
            ]);
            validateAddress(output.address);
            return {
                type: 'complete',
                address: output.address,
                amount: parseFloat(output.amount)
            }
    }


    //     if (typeof output.address !== 'string')
    //         throw new Error('Invalid address in output');

    //     if (typeof output.amount !== 'number')
    //         throw new Error('Invalid amount in output');

    //         if (output.address) {

    //         }

    //     return {
    //         type: 'complete',
    //         address: output.address,
    //         amount: output.amount
    //     }
    // }


}
