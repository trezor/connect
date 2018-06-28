/* @flow */
'use strict';

import { uniq, reverseBuffer } from '../../../utils/bufferUtils';
import { xpubToHDNodeType } from '../../../utils/hdnode';
import { isSegwitPath } from '../../../utils/pathUtils'

import { address as BitcoinJSAddress } from 'bitcoinjs-lib-zcash';

import type {
    Transaction as BitcoinJsTransaction,
    Network as BitcoinJsNetwork,
    Input as BitcoinJsInput,
    Output as BitcoinJsOutput,
} from 'bitcoinjs-lib-zcash';

import type {
    BuildTxInput,
    BuildTxOutput
} from 'hd-wallet';

import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction
} from 'flowtype/trezor';

// Get array of referenced transactions ids
export const getReferencedTransactions = (inputs: Array<BuildTxInput>): Array<string> => {
    const legacyInputs = inputs.filter(utxo => !utxo.segwit);
    if (legacyInputs.length < 1) {
        return [];
    }
    return uniq(legacyInputs, utxo => reverseBuffer(utxo.hash).toString('hex')).map(tx => reverseBuffer(tx.hash).toString('hex'));
}

// Transform referenced transactions from Bitcore to Trezor format
export const transformReferencedTransactions = (txs: Array<BitcoinJsTransaction>): Array<RefTransaction> => {
    return txs.map(tx => {
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
        }
    });
}

const getJoinSplitData = (transaction: BitcoinJsTransaction): ?Buffer => {
    if (transaction.version < 2) {
        return null;
    }
    var buffer = transaction.toBuffer();
    var joinsplitByteLength = transaction.joinsplitByteLength();
    var res = buffer.slice(buffer.length - joinsplitByteLength);
    return res;
}

/*******
 * SignTx validation
 *******/
export const validateInputs = (inputs: Array<TransactionInput>, network: BitcoinJsNetwork): { inputs: Array<TransactionInput>, hdInputs: Array<BuildTxInput> } => {

    const trezorInputs: Array<TransactionInput> = inputs.map(fixPath).map(convertMultisigPubKey.bind(null, network));

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

    return {
        inputs: trezorInputs,
        hdInputs
    };
}

// signTX validation
export const validateOutputs = (outputs: Array<TransactionOutput>, network: BitcoinJsNetwork): Array<TransactionOutput> => {
    const trezorOutputs: Array<TransactionOutput> = outputs.map(fixPath).map(convertMultisigPubKey.bind(null, network));
    for (const output of trezorOutputs) {
        if (output.address_n && isSegwitPath(output.address_n)) {
            if (output.script_type !== 'PAYTOP2SHWITNESS') throw new Error('Output change script_type should be set to PAYTOP2SHWITNESS');
        }
    }
    return trezorOutputs;
}

const fixPath = (utxo: any): any => {
    // make sure bip32 indices are unsigned
    if (utxo.address_n && Array.isArray(utxo.address_n)) {
        utxo.address_n = utxo.address_n.map((i) => i >>> 0);
    }
    return utxo;
};

const convertMultisigPubKey = (network: BitcoinJsNetwork, utxo: any): any => {
    if (utxo.multisig && utxo.multisig.pubkeys) {
        // convert xpubs to HDNodeTypes
        utxo.multisig.pubkeys.forEach(pk => {
            if (typeof pk.node === 'string') {
                pk.node = xpubToHDNodeType(pk.node, network);
            }
        });
    }
    return utxo;
};
