/* @flow */

// local modules
import { reverseBuffer } from '../../../utils/bufferUtils';
import { validatePath, isSegwitPath, getScriptType } from '../../../utils/pathUtils';
import { fixPath, convertMultisigPubKey } from './index';
import { validateParams } from '../helpers/paramsValidator';

// npm types
import type { BuildTxInput } from 'hd-wallet';

// local types
import type { BitcoinNetworkInfo } from '../../../types';
import type { TransactionInput } from '../../../types/trezor/protobuf';

/** *****
 * SignTx: validation
 *******/
export const validateTrezorInputs = (inputs: Array<TransactionInput>, coinInfo: BitcoinNetworkInfo): Array<TransactionInput> => {
    const trezorInputs = inputs.map(fixPath).map(convertMultisigPubKey.bind(null, coinInfo.network));
    for (const input of trezorInputs) {
        validatePath(input.address_n);
        const useAmount = isSegwitPath(input.address_n);
        validateParams(input, [
            { name: 'prev_hash', type: 'string', obligatory: true },
            { name: 'prev_index', type: 'number', obligatory: true },
            { name: 'script_type', type: 'string' },
            { name: 'amount', type: 'string', obligatory: useAmount },
            { name: 'sequence', type: 'number' },
            { name: 'multisig', type: 'object' },
        ]);
    }
    return trezorInputs;
};

/** *****
 * Transform from Trezor format to hd-wallet, called from SignTx to get refTxs from bitcore
 *******/
export const inputToHD = (input: TransactionInput): BuildTxInput => {
    return {
        hash: reverseBuffer(Buffer.from(input.prev_hash, 'hex')),
        index: input.prev_index,
        path: input.address_n,
        amount: input.amount,
        segwit: isSegwitPath(input.address_n),
    };
};

/** *****
 * Transform from hd-wallet format to Trezor
 *******/
export const inputToTrezor = (input: BuildTxInput, sequence: number): TransactionInput => {
    const { hash, index, path, amount } = input;
    return {
        address_n: path,
        prev_index: index,
        prev_hash: reverseBuffer(hash).toString('hex'),
        script_type: getScriptType(path),
        amount,
        sequence,
    };
};
