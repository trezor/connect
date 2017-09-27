import * as _ from 'lodash';

export default class ComposingTransaction {
    
    constructor(coinInfo, basePath, inputs, outputs) {
        const inp = [];
        for(let utxo of inputs){
            inp.push({
                hash: reverseBuffer(new Buffer(utxo.transactionHash, 'hex')),
                index: utxo.index,
                path: basePath.concat([...utxo.addressPath]),
                amount: utxo.value,
                segwit: coinInfo.segwit
            })
        }
        this.inputs = inp;
        this.outputs = outputs;
    }

    getReferencedTx(backend, account) {
        if (account.segwit || backend.coinInfo.forkid != null) {
            return Promise.resolve([]);
        }
        const uins: Array<string> = uniq(this.inputs, inp => reverseBuffer(inp.hash).toString('hex')).map(tx => reverseBuffer(tx.hash).toString('hex'));
        return Promise.all(
            uins.map(id => backend.loadTransaction(account.info, id))
        );
    }

    getTx() {
        return {
            inputs: this.inputs,
            outputs: this.outputs
        }
    }
}

const reverseBuffer = (src: Buffer): Buffer => {
    const buffer = new Buffer(src.length);
    for (let i = 0, j = src.length - 1; i <= j; ++i, --j) {
        buffer[i] = src[j];
        buffer[j] = src[i];
    }
    return buffer;
}

export function uniq<X>(array: Array<X>, fun: (inp: X) => string | number): Array<X> {
    return _.uniq(array, fun);
}

const TX_EMPTY_SIZE = 8;
const TX_PUBKEYHASH_INPUT = 40 + 2 + 106;
const TX_PUBKEYHASH_OUTPUT = 8 + 2 + 25;
const INSUFFICIENT_FUNDS = new Error('Insufficient funds');

export const selectUnspents = (unspents, outputs, feePerByte) => {
    // based on https://github.com/dcousens/coinselect

    let candidates = [];
    let outgoing = 0;
    let incoming = 0;
    let byteLength = TX_EMPTY_SIZE;

    unspents = unspents.slice().sort((a, b) => {
        let ac = (a.confirmations || 0);
        let bc = (b.confirmations || 0);
        return (bc - ac) ||         // descending confirmations
               (a.value - b.value); // ascending value
    });

    for (let i = 0; i < outputs.length; i++) {
        outgoing += outputs[i].amount;
        byteLength += TX_PUBKEYHASH_OUTPUT;
    }

    for (let i = 0; i < unspents.length; i++) {
        incoming += unspents[i].value;
        byteLength += TX_PUBKEYHASH_INPUT;

        candidates.push(unspents[i]);

        if (incoming < outgoing) {
            // don't bother with fees until we cover all outputs
            continue;
        }

        let baseFee = estimateFee(byteLength, feePerByte);
        let total = outgoing + baseFee;

        if (incoming < total) {
            // continue until we can afford the base fee
            continue;
        }

        let feeWithChange = estimateFee(byteLength + TX_PUBKEYHASH_OUTPUT, feePerByte);
        let totalWithChange = outgoing + feeWithChange;

        // can we afford a change output?
        if (incoming >= totalWithChange) {
            let change = incoming - totalWithChange;
            return {
                inputs: candidates,
                change: change,
                fee: feeWithChange
            };
        } else {
            let fee = incoming - total;
            return {
                inputs: candidates,
                change: 0,
                fee: fee
            };
        }
    }

    throw INSUFFICIENT_FUNDS;
}

const estimateFee = (byteLength, feePerByte) => {
    return byteLength * feePerByte;
}

export const findInputs = (utxos, inputs) => {
    let found = [];
    for(let input of utxos){
        for (let inp of inputs) {
            if (input.transactionHash === inp.prev_hash) {
                found.push(input);
            }
        }
    }
    return found;
}

export const transformResTxs = (refTxs) => {
    const refs = [];
    for (let r of refTxs) {
        refs.push({
            hash: reverseBuffer(r.getHash()).toString('hex'),
            //hash: "4e1ecd39f37a900bb670491909ceaf7982fc3b70a6ad4bb071705166a825ac55",
            version: r.version,
            lock_time: r.locktime,
            inputs: r.ins.map(input => {
                let hash = input.hash.slice();
                Array.prototype.reverse.call(hash);
                return {
                    prev_hash: hash.toString('hex'),
                    prev_index: input.index >>> 0,
                    sequence: input.sequence >>> 0,
                    script_sig: input.script.toString('hex')
                };
            }),
            bin_outputs: r.outs.map(output => {
                return {
                    amount: output.value,
                    script_pubkey: output.script.toString('hex')
                };
            })
        });
    }
    return refs;
}



// export const parseOutput2bjs = (output) => {
//     const out = {
//         amount: output.amount,
//         value: output.amount
//     }

//     if (output.address_n || output.path) {
//         out.path = output.address_n || output.path;
//     }
//     if (output.address) {
//         out.address = output.address;
//     }
//     return out;
// }
