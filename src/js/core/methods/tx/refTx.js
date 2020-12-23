/* @flow */

import {
    coins as BitcoinJSCoins,
    Transaction as BitcoinJsTransaction,
} from '@trezor/utxo-lib';
// local modules
import { reverseBuffer } from '../../../utils/bufferUtils';
import { getHDPath, getScriptType, getOutputScriptType } from '../../../utils/pathUtils';

// npm types
import type { TypedRawTransaction } from '@trezor/blockchain-link';
import type { Input as BitcoinJsInput, Output as BitcoinJsOutput } from '@trezor/utxo-lib';

// local types
import type { CoinInfo, RefTransaction, AccountAddresses } from '../../../types';
import type { TxInputType, TxOutputType } from '../../../types/trezor/protobuf';

BitcoinJsTransaction.USE_STRING_VALUES = true;

// Get array of unique referenced transactions ids
export const getReferencedTransactions = (inputs: TxInputType[]): string[] => {
    const result: string[] = [];
    inputs.forEach(input => {
        if (input.prev_hash && !result.includes(input.prev_hash)) {
            result.push(input.prev_hash);
        }
    });
    return result;
};

// Get array of unique original transactions ids (used in rbf)
export const getOrigTransactions = (inputs: TxInputType[], outputs: TxOutputType[]): string[] => {
    const result: string[] = [];
    inputs.forEach(input => {
        if (input.orig_hash && !result.includes(input.orig_hash)) {
            result.push(input.orig_hash);
        }
    });
    outputs.forEach(output => {
        if (output.orig_hash && !result.includes(output.orig_hash)) {
            result.push(output.orig_hash);
        }
    });
    return result;
};

// BitcoinJsTransaction returns input.witness as Buffer[]
// expected hex response format:
// chunks size + (chunk[i].size + chunk[i])
// TODO: this code should be implemented in BitcoinJsTransaction (@trezor/utxo-lib)
const getWitness = (witness?: Buffer[]) => {
    if (!Array.isArray(witness)) return;
    const getChunkSize = (n: number) => {
        const buf = Buffer.allocUnsafe(1);
        buf.writeUInt8(n);
        return buf;
    };
    const chunks = witness.reduce((arr, chunk) => {
        return arr.concat([
            getChunkSize(chunk.length),
            chunk,
        ]);
    }, [getChunkSize(witness.length)]);

    return Buffer.concat(chunks).toString('hex');
};

// Find inputs used for current sign tx process related to referenced transaction
// related inputs and outputs needs more info (address_n, amount, script_type, witness)
// const findAddressN = (vinVout?: TxInputType[] | TxOutputType[], txid: string, index: number) => {
//     if (!vinVout) return;
//     const utxo = vinVout.find(o => o.orig_index === index && o.orig_hash === txid && o.address_n);
//     return utxo ? utxo.address_n : undefined;
// };

// Transform orig transactions from Blockbook (blockchain-link) to Trezor format
export const transformOrigTransactions = (
    txs: TypedRawTransaction[],
    coinInfo: CoinInfo,
    addresses: AccountAddresses,
): RefTransaction[] => txs.flatMap(raw => {
    if (coinInfo.type !== 'bitcoin' || raw.type !== 'blockbook' || !addresses) return [];
    const { hex, vin, vout } = raw.tx;
    const tx = BitcoinJsTransaction.fromHex(hex, coinInfo.network);
    const inputAddresses = addresses.used.concat(addresses.change);

    // inputs, required by TXORIGINPUT (TxAckInput) request from Trezor
    const inputsMap = (input: BitcoinJsInput, i: number) => {
        // TODO: is vin[i] a correct way? order in Bitcoinjs
        const address = vin[i].addresses.join(''); // controversial: is there a possibility to have more than 1 address in this tx? multisig?
        const inputAddress = inputAddresses.find(addr => addr.address === address);
        const address_n = inputAddress ? getHDPath(inputAddress.path) : []; // TODO: is fallback necessary?

        return {
            address_n,
            prev_hash: reverseBuffer(input.hash).toString('hex'),
            prev_index: input.index,
            script_sig: input.script.toString('hex'),
            sequence: input.sequence,
            script_type: getScriptType(address_n),
            multisig: undefined, // TODO
            amount: vin[i].value,
            decred_tree: undefined, // TODO
            witness: tx.hasWitnesses() ? getWitness(input.witness) : undefined,
            ownership_proof: undefined, // TODO
            commitment_data: undefined, // TODO
        };
    };

    // outputs, required by TXORIGOUTPUT (TxAckOutput) request from Trezor
    const outputsMap = (output: BitcoinJsOutput, i: number) => {
        // TODO: is vout[i] a correct way? order in Bitcoinjs
        const address = vout[i].addresses.join(''); // controversial: is there a possibility to have more than 1 address in this tx? multisig?
        const changeAddress = addresses.change.find(addr => addr.address === address);
        const address_n = changeAddress && getHDPath(changeAddress.path);
        const amount = typeof output.value === 'number' ? output.value.toString() : output.value;
        // console.warn('OUT ADDR', BitcoinJSAddress.fromOutputScript(output.script, coinInfo.network), address);
        return address_n ? {
            address_n,
            amount,
            script_type: getOutputScriptType(address_n),
        } : {
            address,
            amount,
            script_type: 'PAYTOADDRESS',
        };
    };

    const extraData = tx.getExtraData();
    const version_group_id = BitcoinJSCoins.isZcashType(tx.network) && typeof tx.versionGroupId === 'number' && tx.version >= 3 ? tx.versionGroupId : undefined;
    return [{
        version: tx.isDashSpecialTransaction() ? tx.version | tx.type << 16 : tx.version,
        hash: tx.getId(),
        inputs: tx.ins.map(inputsMap),
        outputs: tx.outs.map(outputsMap),
        extra_data: extraData ? extraData.toString('hex') : undefined,
        lock_time: tx.locktime,
        timestamp: tx.timestamp,
        version_group_id,
        expiry: tx.expiryHeight,
    }];
});

// Transform referenced transactions from Blockbook (blockchain-link) to Trezor format
export const transformReferencedTransactions = (
    txs: TypedRawTransaction[],
    coinInfo: CoinInfo,
): RefTransaction[] => txs.flatMap(raw => {
    if (coinInfo.type !== 'bitcoin' || raw.type !== 'blockbook') return [];
    const { hex } = raw.tx;
    const tx = BitcoinJsTransaction.fromHex(hex, coinInfo.network);

    // inputs, required by TXINPUT (TxAckPrevInput) request from Trezor
    const inputsMap = (input: BitcoinJsInput, i: number) => {
        return {
            prev_index: input.index,
            sequence: input.sequence,
            prev_hash: reverseBuffer(input.hash).toString('hex'),
            script_sig: input.script.toString('hex'),
        };
    };

    // map bin_outputs, required by TXOUTPUT (TxAckPrevOutput) request from Trezor
    const binOutputsMap = (output: BitcoinJsOutput) => ({
        amount: typeof output.value === 'number' ? output.value.toString() : output.value,
        script_pubkey: output.script.toString('hex'),
    });

    const extraData = tx.getExtraData();
    const version_group_id = BitcoinJSCoins.isZcashType(tx.network) && typeof tx.versionGroupId === 'number' && tx.version >= 3 ? tx.versionGroupId : undefined;
    return [{
        version: tx.isDashSpecialTransaction() ? tx.version | tx.type << 16 : tx.version,
        hash: tx.getId(),
        inputs: tx.ins.map(inputsMap),
        bin_outputs: tx.outs.map(binOutputsMap),
        extra_data: extraData ? extraData.toString('hex') : undefined,
        lock_time: tx.locktime,
        timestamp: tx.timestamp,
        version_group_id,
        expiry: tx.expiryHeight,
    }];
});
