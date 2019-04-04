/* @flow */

// local modules
import { reverseBuffer } from '../../../utils/bufferUtils';
import { isSegwitPath, getScriptType } from '../../../utils/pathUtils';
import { fixPath, convertMultisigPubKey } from './index';

// npm types
import type { BuildTxInput } from 'hd-wallet';

// local types
import type { BitcoinNetworkInfo } from '../../../types';
import type { TransactionInput } from '../../../types/trezor';

/** *****
 * SignTx: validation
 *******/
export const validateTrezorInputs = (inputs: Array<TransactionInput>, coinInfo: BitcoinNetworkInfo): Array<TransactionInput> => {
    return inputs.map(fixPath).map(convertMultisigPubKey.bind(null, coinInfo.network));
};

/** *****
 * Transform from Trezor format to hd-wallet
 *******/
export const inputToHD = (input: TransactionInput): BuildTxInput => {
    const segwit = isSegwitPath(input.address_n);
    if (segwit) {
        if (!input.amount) throw new Error('Input amount not set');
        if (!input.script_type) throw new Error('Input script_type not set');
        // if (input.script_type !== 'SPENDP2SHWITNESS') throw new Error('Input script_type should be set to SPENDP2SHWITNESS');
    }
    const address_n = input.address_n;
    if (!Array.isArray(address_n)) {
        throw new Error('Input address_n not set');
    }

    return {
        hash: reverseBuffer(Buffer.from(input.prev_hash, 'hex')),
        index: input.prev_index,
        path: address_n,
        amount: input.amount,
        segwit: segwit,
    };
};

/** *****
 * Transform from hd-wallet format to Trezor
 *******/
export const inputToTrezor = (input: BuildTxInput, sequence: number): TransactionInput => {
    const { hash, index, path, amount } = input;
    return {
        prev_index: index,
        prev_hash: reverseBuffer(hash).toString('hex'),
        address_n: path,
        script_type: getScriptType(path) || 'SPENDADDRESS',
        amount,
        sequence,
    };
};
