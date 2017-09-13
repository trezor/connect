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

export function reverseBuffer(src: Buffer): Buffer {
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