/* @flow */

import { uniq, reverseBuffer } from '../utils/utils';
import { fixPath, convertXpub } from '../utils/path';
import { HD_HARDENED } from '../utils/constants';

export default class ComposingTransaction {

    backend: BitcoreBackend;
    inputs: Array<TrezorInputs>;
    outputs: Array<TrezorInputs>;
    
    constructor(backend, inputs, outputs) {
        this.backend = backend;
        this.inputs = inputs;
        this.outputs = outputs;
    }

    getReferencedTx() {
        const nonSegwitInputs = [];
        for (let utxo of this.inputs) {
            if (!utxo.segwit) {
                nonSegwitInputs.push(utxo);
            }
        }

        if (nonSegwitInputs.length < 1) {
            return Promise.resolve([]);
        } else {
            //const uins: Array<string> = uniq(nonSegwitInputs, inp => reverseBuffer(inp.hash).toString('hex')).map(tx => reverseBuffer(tx.hash).toString('hex'));
            const uins: Array<string> = uniq(this.inputs, inp => reverseBuffer(inp.hash).toString('hex')).map(tx => reverseBuffer(tx.hash).toString('hex'));
            return Promise.all(
                uins.map(id => this.backend.loadTransaction(id))
            );
        }
    }
    
    // not used
    checkInput(input) {
        // check if input has all required fields
        let isSegwit: boolean = (input.address_n[0] >>> 0) === ((49 | HD_HARDENED) >>> 0)
        if (isSegwit) {
            if (input.script_type && input.amount) {
                return Promise.resolve(input);
            }
            return this.backend.loadTransaction(input.prev_hash)
                .then(tx => {
                    return {
                        ...input,
                        script_type: 'SPENDP2SHWITNESS',
                        amount: tx.outs[input.prev_index].value
                    }
                })
        } else {
            return Promise.resolve(input);
        }
    }

    getTx() {
        return {
            inputs: this.inputs,
            outputs: this.outputs
        }
    }
}

// signTX validation
export const validateInputs = (inputs, network) => {
    const bitcoreInputs = [];
    const trezorInputs = inputs.map(fixPath).map(convertXpub.bind(null, network));

    for (let utxo of trezorInputs) {
        let segwit = (utxo.address_n[0] >>> 0) === ((49 | HD_HARDENED) >>> 0);
        if (segwit) {
            if (!utxo.amount) throw new Error('Input amount not set');
            if (!utxo.script_type) throw new Error('Input script_type not set');
            //if (utxo.script_type !== 'SPENDP2SHWITNESS') throw new Error('Input script_type should be set to SPENDP2SHWITNESS');
        }

        bitcoreInputs.push({
            hash: reverseBuffer(new Buffer(utxo.prev_hash, 'hex')),
            index: utxo.prev_index,
            path: utxo.address_n,
            amount: utxo.amount,
            segwit: segwit
        });
    }

    return { trezorInputs, bitcoreInputs };
}

// signTX validation
export const validateOutputs = (outputs, network) => {
    const trezorOutputs = outputs.map(fixPath).map(convertXpub.bind(null, network));
    for (let output of trezorOutputs) {
        if (output.address_n) {
            let segwit = (output.address_n[0] >>> 0) === ((49 | HD_HARDENED) >>> 0);
            if (segwit) {
                if (output.script_type !== 'PAYTOP2SHWITNESS') throw new Error('Output change script_type should be set to PAYTOP2SHWITNESS');
            }
        }
    }
    return trezorOutputs;
}

export const transformResTxs = (tx: bitcoin.Transaction): trezor.RefTransaction => {
    const data = getJoinSplitData(tx);
    const dataStr = data == null ? null : data.toString('hex');
    return {
        lock_time: tx.locktime,
        version: tx.version,
        hash: tx.getId(),
        inputs: tx.ins.map((input: bitcoin.Input) => {
            return {
                prev_index: input.index,
                sequence: input.sequence,
                prev_hash: reverseBuffer(input.hash).toString('hex'),
                script_sig: input.script.toString('hex'),
            };
        }),
        bin_outputs: tx.outs.map((output: bitcoin.Output) => {
            return {
                amount: output.value,
                script_pubkey: output.script.toString('hex'),
            };
        }),
        extra_data: dataStr,
    };
}

function getJoinSplitData(transaction) {
    if (transaction.version < 2) {
        return null;
    }
    var buffer = transaction.toBuffer();
    var joinsplitByteLength = transaction.joinsplitByteLength();
    var res = buffer.slice(buffer.length - joinsplitByteLength);
    return res;
}
