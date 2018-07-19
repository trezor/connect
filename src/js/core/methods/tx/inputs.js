/* @flow */
'use strict';
// local modules
import { reverseBuffer } from '../../../utils/bufferUtils';
import { isSegwitPath } from '../../../utils/pathUtils';
import { fixPath, convertMultisigPubKey } from './index';

// npm types
import type { BuildTxInput } from 'hd-wallet';

// local types
import type { CoinInfo } from 'flowtype';
import type { TransactionInput } from '../../../types/trezor';

/*******
 * SignTx: validation
 *******/
export const validateTrezorInputs = (inputs: Array<TransactionInput>, coinInfo: CoinInfo): Array<TransactionInput> => {

    const trezorInputs: Array<TransactionInput> = inputs.map(fixPath).map(convertMultisigPubKey.bind(null, coinInfo.network));

    const hdInputs: Array<BuildTxInput> = [];
    for (let input of inputs) {
        let segwit = isSegwitPath(input.address_n);
        if (segwit) {
            if (!input.amount) throw new Error('Input amount not set');
            if (!input.script_type) throw new Error('Input script_type not set');
            // if (input.script_type !== 'SPENDP2SHWITNESS') throw new Error('Input script_type should be set to SPENDP2SHWITNESS');
        }

        hdInputs.push({
            hash: reverseBuffer(new Buffer(input.prev_hash, 'hex')),
            index: input.prev_index,
            path: input.address_n,
            amount: input.amount,
            segwit: segwit
        });
    }

    return inputs;
}

/*******
 * Transform from TREZOR format to hd-wallet
 *******/
export const inputToHD = (input: TransactionInput): BuildTxInput => {
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

/*******
 * Transform from hd-wallet format to TREZOR
 *******/
export const inputToTrezor = (input: BuildTxInput, sequence: number): TransactionInput => {
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
