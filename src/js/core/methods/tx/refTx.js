/* @flow */

import { coins as BitcoinJSCoins } from '@trezor/utxo-lib';
// local modules
import { reverseBuffer } from '../../../utils/bufferUtils';

// npm types
import type {
    Transaction as BitcoinJsTransaction,
} from '@trezor/utxo-lib';

import type { BuildTxInput } from 'hd-wallet';

// local types
import type { RefTransaction } from '../../../types/trezor';

// Get array of unique referenced transactions ids
export const getReferencedTransactions = (inputs: Array<BuildTxInput>): Array<string> => {
    const legacyInputs = inputs.filter(utxo => !utxo.segwit);
    if (legacyInputs.length < 1) {
        return [];
    }
    return legacyInputs.reduce((result: string[], utxo: BuildTxInput) => {
        const hash = reverseBuffer(utxo.hash).toString('hex');
        if (result.includes(hash)) return result;
        return result.concat(hash);
    }, []);
};

// Transform referenced transactions from Bitcore to Trezor format
export const transformReferencedTransactions = (txs: Array<BitcoinJsTransaction>): Array<RefTransaction> => {
    return txs.map(tx => {
        const extraData = tx.getExtraData();
        const version_group_id = BitcoinJSCoins.isZcash(tx.network) ? parseInt(tx.versionGroupId, 16) : null;
        return {
            version: tx.isDashSpecialTransaction() ? tx.version | tx.type << 16 : tx.version,
            hash: tx.getId(),
            inputs: tx.ins.map(input => {
                return {
                    prev_index: input.index,
                    sequence: input.sequence,
                    prev_hash: reverseBuffer(input.hash).toString('hex'),
                    script_sig: input.script.toString('hex'),
                };
            }),
            bin_outputs: tx.outs.map(output => {
                return {
                    amount: typeof output.value === 'number' ? output.value.toString() : output.value,
                    script_pubkey: output.script.toString('hex'),
                };
            }),
            extra_data: extraData ? extraData.toString('hex') : null,
            lock_time: tx.locktime,
            timestamp: tx.timestamp,
            version_group_id,
            expiry: tx.expiry,
        };
    });
};
