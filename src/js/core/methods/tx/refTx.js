/* @flow */

import { coins as BitcoinJSCoins } from '@trezor/utxo-lib';
// local modules
import { reverseBuffer } from '../../../utils/bufferUtils';

// npm types
import type { Transaction as BitcoinJsTransaction } from '@trezor/utxo-lib';
import type { BuildTxInput } from 'hd-wallet';

// local types
import type { RefTransaction } from '../../../types/networks/bitcoin';

// Get array of unique referenced transactions ids
export const getReferencedTransactions = (inputs: BuildTxInput[]): string[] => {
    return inputs.reduce((result: string[], utxo: BuildTxInput) => {
        const hash = reverseBuffer(utxo.hash).toString('hex');
        if (result.includes(hash)) return result;
        return result.concat(hash);
    }, []);
};

// Transform referenced transactions from Bitcore to Trezor format
export const transformReferencedTransactions = (txs: BitcoinJsTransaction[]): RefTransaction[] => {
    return txs.map(tx => {
        const extraData = tx.getExtraData();
        const version_group_id = BitcoinJSCoins.isZcashType(tx.network) && typeof tx.versionGroupId === 'number' && tx.version >= 3 ? tx.versionGroupId : undefined;
        return {
            version: tx.isDashSpecialTransaction() ? tx.version | tx.type << 16 : tx.version,
            hash: tx.getId(),
            inputs: tx.ins.map(input => ({
                prev_index: input.index,
                sequence: input.sequence,
                prev_hash: reverseBuffer(input.hash).toString('hex'),
                script_sig: input.script.toString('hex'),
            })),
            bin_outputs: tx.outs.map(output => ({
                amount: typeof output.value === 'number' ? output.value.toString() : output.value,
                script_pubkey: output.script.toString('hex'),
            })),
            extra_data: extraData ? extraData.toString('hex') : undefined,
            lock_time: tx.locktime,
            timestamp: tx.timestamp,
            version_group_id,
            expiry: tx.expiryHeight,
        };
    });
};
