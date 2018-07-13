/* @flow */
'use strict';

import { reverseBuffer } from '../../../utils/bufferUtils';
import { isScriptHash } from '../../../utils/addressUtils';
import bchaddrjs from 'bchaddrjs';

import type {
    BuildTxInput,
    BuildTxOutput
} from 'hd-wallet';

import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction
} from '../../../types/trezor';

import type { CoinInfo } from 'flowtype';

import type {
    Network as BitcoinJsNetwork,
} from 'bitcoinjs-lib-zcash';


// transform from hd-wallet format to TREZOR
export const input = (input: BuildTxInput, sequence: number): TransactionInput => {
    const { hash, index, path, amount } = input;
    return {
        prev_index: index,
        prev_hash: reverseBuffer(hash).toString('hex'),
        address_n: path,
        script_type: input.segwit ? 'SPENDP2SHWITNESS' : 'SPENDADDRESS',
        amount,
        sequence,
    };
}

// transform from hd-wallet format to TREZOR
export const output = (output: BuildTxOutput, coinInfo: CoinInfo): TransactionOutput => {
    if (output.address == null) {
        if (output.opReturnData != null) {
            if (output.value != null) {
                throw new Error('Wrong type.');
            }

            // $FlowIssue
            const data: Buffer = output.opReturnData;
            return {
                amount: 0,
                op_return_data: data.toString('hex'),
                script_type: 'PAYTOOPRETURN',
            };
        }

        if (!output.path) {
            throw new Error('Both address and path of an output cannot be null.');
        }

        const address_n: Array<number> = _flow_makeArray(output.path);
        // $FlowIssue
        const amount: number = output.value;

        return {
            address_n,
            amount,
            script_type: output.segwit ? 'PAYTOP2SHWITNESS' : 'PAYTOADDRESS',
        };
    }
    const address = output.address;
    if (typeof address !== 'string') {
        throw new Error('Wrong address type.');
    }

    // $FlowIssue
    const amount: number = output.value;

    const isCashAddress: boolean = !!(coinInfo.cashAddrPrefix);


    isScriptHash(address, coinInfo);

    // make sure that cashaddr has prefix
    return {
        address: isCashAddress ? bchaddrjs.toCashAddress(address) : address,
        //address: address,
        amount: amount,
        script_type: 'PAYTOADDRESS',
    };
}

function _flow_makeArray(a: mixed): Array<number> {
    if (!Array.isArray(a)) {
        throw new Error('Both address and path of an output cannot be null.');
    }
    const res: Array<number> = [];
    a.forEach(k => {
        if (typeof k === 'number') {
            res.push(k);
        }
    });
    return res;
}
