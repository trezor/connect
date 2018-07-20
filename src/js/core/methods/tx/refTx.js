/* @flow */
'use strict';

// local modules
import { uniq, reverseBuffer } from '../../../utils/bufferUtils';

// npm types
import type {
    Input as BitcoinJsInput,
    Output as BitcoinJsOutput,
    Transaction as BitcoinJsTransaction,
} from 'bitcoinjs-lib-zcash';

import type { BuildTxInput } from 'hd-wallet';

// local types
import type { RefTransaction } from '../../../types/trezor';

// Get array of referenced transactions ids
export const getReferencedTransactions = (inputs: Array<BuildTxInput>): Array<string> => {
    const legacyInputs = inputs.filter(utxo => !utxo.segwit);
    if (legacyInputs.length < 1) {
        return [];
    }
    return uniq(legacyInputs, utxo => reverseBuffer(utxo.hash).toString('hex')).map(tx => reverseBuffer(tx.hash).toString('hex'));
};

// Transform referenced transactions from Bitcore to Trezor format
export const transformReferencedTransactions = (txs: Array<BitcoinJsTransaction>): Array<RefTransaction> => {
    return txs.map(tx => {
        // eslint-disable-next-line no-use-before-define
        const data = getJoinSplitData(tx);
        const dataStr = data == null ? null : data.toString('hex');
        return {
            lock_time: tx.locktime,
            version: tx.version,
            hash: tx.getId(),
            inputs: tx.ins.map((input: BitcoinJsInput) => {
                return {
                    prev_index: input.index,
                    sequence: input.sequence,
                    prev_hash: reverseBuffer(input.hash).toString('hex'),
                    script_sig: input.script.toString('hex'),
                };
            }),
            bin_outputs: tx.outs.map((output: BitcoinJsOutput) => {
                return {
                    amount: output.value,
                    script_pubkey: output.script.toString('hex'),
                };
            }),
            extra_data: dataStr,
        };
    });
};

const getJoinSplitData = (transaction: BitcoinJsTransaction): ?Buffer => {
    if (transaction.version < 2) {
        return null;
    }
    const buffer = transaction.toBuffer();
    const joinsplitByteLength = transaction.joinsplitByteLength();
    const res = buffer.slice(buffer.length - joinsplitByteLength);
    return res;
};
