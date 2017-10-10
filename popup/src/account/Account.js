/* @flow */

import { showSelectionAccounts, showAlert } from '../view';
import { HD_HARDENED } from '../utils/constants';
import { sortBy, range, at, reverseBuffer } from '../utils/utils';
import { getPathForIndex } from '../utils/path';

export default class Account {

    static fromPath(device, backend, path): Account {
        const purpose = path[0] & ~HD_HARDENED;
        const id = path[2] & ~HD_HARDENED;
        const coinInfo = backend.coinInfo;
        coinInfo.segwit = (purpose === 49);
        return device.session.getHDNode(path, coinInfo.network).then(
            node => new Account(id, path, node.toBase58(), backend)
        );
    }

    static fromIndex(device, backend, id): Account {
        const coinInfo = backend.coinInfo;
        const path: Array<number> = getPathForIndex(coinInfo.segwit ? 49 : 44, coinInfo.bip44, id);
        return device.session.getHDNode(path, coinInfo.network).then(
            node => new Account(id, path, node.toBase58(), backend)
        );
    }

    id: number;
    basePath: Array<number>;
    xpub: string;
    backend: Object;
    info: Object;

    constructor(
        id: number,
        path: Array<number>,
        xpub: string,
        backend
    ) {
        this.id = id;
        this.basePath = path;
        this.xpub = xpub;
        this.backend = backend;
        this.segwit = backend.coinInfo.segwit;
    }

    discover() {
        return this.backend.loadAccountInfo(
                this.xpub,
                null,
                () => { },
                (disposer) => { },
                this.segwit
            ).then(
                (info) => {
                    this.info = info;
                    return this;
                },
                (error) => {
                    // TODO: throw eerrror
                    console.error('[account] Account loading error', error);
                }
            );
    }

    getXpub() {
        return this.xpub;
    }

    getPath() {
        return this.basePath;
    }

    getAddressPath(address) {
        let addresses = this.info.usedAddresses.concat(this.info.unusedAddresses);
        let index = addresses.indexOf(address);
        // TODO: find in change addresses
        //if (index < 0)
        return this.basePath.concat([0, index]);
    }

    getNextAddress() {
        return this.info.unusedAddresses[0];
    }

    getNextAddressId() {
        return this.info.usedAddresses.length;
    }

    getChangeAddress() {
        return this.info.changeAddresses[this.info.changeIndex];
    }

    isUsed() {
        return (this.info && this.info.transactions.length > 0);
    }

    getBalance() {
        return this.info.balance;
    }

    getConfirmedBalance() {
        return this.info.balance; // TODO: read confirmations
    }

    getUtxos() {
        return this.info.utxos;
    }

    prevTxRequired(): boolean {
        if (this.segwit || this.backend.coinInfo.forkid !== null) {
            return false;
        }
        return true;
    }

    composeTx(outputs: Array<TrezorJsOutputToSign>, feePerByte: number, tryMinFee: boolean) {
        for (let o of outputs) {
            o.value = o.amount;
        }
        return this.findUnspents().then(utxos => {
            return this.buildTxWithUnspents(outputs, feePerByte, utxos, tryMinFee);
        });
    }

    findUnspents(): Promise<Array<UtxoInfo>> {
        const pheight: Promise<number> = loadCurrentHeight(this.backend);
        if (this.info == null) {
            return Promise.reject('Utxos not loaded yet');
        }
        const utxos = this.info.utxos;
        return pheight.then(
            (height: number) => {
                const rightUtxos = utxos.filter(utxo => {
                    if (utxo.coinbase) {
                        // coinbase outputs need at least 100 blocks above
                        if (utxo.height == null) {
                            return false;
                        }
                        return (height - utxo.height) > 100;
                    } else {
                        return true;
                    }
                });

                // sort utxos (by block, by value, unconfirmed last)
                rightUtxos.sort((a, b) => {
                    const vd: number = a.value - b.value; // order by value
                    if (a.height == null) {
                        if (b.height == null) {
                            return vd;
                        } else {
                            return +1;
                        }
                    } else {
                        if (b.height == null) {
                            return -1;
                        } else {
                            const hd: number = a.height - b.height; // order by block
                            return hd !== 0 ? hd : vd;
                        }
                    }
                });
                return rightUtxos;
            },
            (error) => {
                console.warn('[account] Error while retrieving ' +
                    'current height, immature coinbase inputs will be ' +
                    'included in the UTXO set', error);
                return utxos;
            }
        );
    }

    buildTxWithUnspents(
        outputs: Array<TrezorJsOutputToSign>,
        feePerByte: number,
        utxos: Array<UtxoInfo>,
        tryMinFee: boolean
    ): Promise<BuildTxResult> {
        return Promise.resolve()
            .then(() => this._tryToBuild(utxos, outputs, feePerByte, tryMinFee))
            .then((res: BuildTxPreResult): BuildTxResult => {
                const {utxos, outputs, permutation, inputSum, fee, bytes, feePerKb} = res;
                const inputs: Array<TrezorJsInputToSign> =
                    tryMinFee // when trying build for countMax -> I don't care about actual result -> whatever
                        ? utxos.map(utxo => {
                            const res: TrezorJsInputToSign = {
                                hash: reverseBuffer(new Buffer(utxo.transactionHash, 'hex')),
                                index: utxo.index,
                                path: this.basePath.concat([...utxo.addressPath]),
                                segwit: this.segwit,
                            };
                            if (!this.prevTxRequired()) {
                                res.amount = utxo.value;
                            }
                            return res;
                        })
                        : [];
                return {
                    account: this,
                    tx: {
                        inputs,
                        outputs,
                    },
                    permutation,
                    inputSum,
                    fee,
                    bytes,
                    feePerKb,
                };
            });
    }

    _tryToBuild(utxos: Array<UtxoInfo>,
        outputs: Array<TrezorJsOutputToSign>,
        feePerByte: number,
        tryMinFee: boolean
    ): BuildTxPreResult {
        const allOutputSum = outputs.reduce((prev, out) => prev + out.value, 0);
        const allInputSum = utxos.filter(utxo => (utxo.value >= this.backend.coinInfo.dustLimit))
            .reduce((prev, out) => prev + out.value, 0);

        if (allInputSum <= allOutputSum) {
            throw new Error('Insufficient input');
        }
        // First, I try all change as fees. If it works, I try to make fee smaller.
        const res = this._tryToBuildWithGivenFee(utxos, outputs, feePerByte, allInputSum - allOutputSum);
        if (res === 'not enough funds' || res === 'fee too low') {
            throw new Error('Not enough funds');
        }
        if (tryMinFee) {
            return this._findMinFee(utxos, outputs, feePerByte, 0, allInputSum - allOutputSum, res);
        }
        return res;
    }

    _findMinFee(utxos: Array<UtxoInfo>,
        outputs: Array<TrezorJsOutputToSign>,
        feePerByte: number,
        minFeeAttempt: number,
        maxFeeAttempt: number,
        prev: BuildTxPreResult): BuildTxPreResult {
        if (maxFeeAttempt - minFeeAttempt < 2) {
            return prev;
        }
        const midFee = Math.floor((minFeeAttempt + maxFeeAttempt) / 2);
        const midRes = this._tryToBuildWithGivenFee(utxos, outputs, feePerByte, midFee);
        if (midRes === 'not enough funds') {
            throw new Error('Strange build tx result.');
        }
        if (midRes === 'fee too low') {
            return this._findMinFee(utxos, outputs, feePerByte, midFee, maxFeeAttempt, prev);
        } else {
            return this._findMinFee(utxos, outputs, feePerByte, minFeeAttempt, midFee, midRes);
        }
    }

    _tryToBuildWithGivenFee(utxos: Array<UtxoInfo>,
        outputs: Array<TrezorJsOutputToSign>,
        feePerByte: number,
        feeAttempt: number
    ): BuildTxPreResult | 'not enough funds' | 'fee too low' {
        const result: ?BuildTxPreResult = this._constructTx(utxos, outputs, feeAttempt);
        if (result == null) {
            return 'not enough funds';
        }

        const outputSum = result.outputs.reduce((prev, outp) => prev + outp.value, 0);
        const inputSum = result.inputSum;
        const actualFee: number = inputSum - outputSum;

        const bytes = result.bytes;
        const estimatedFee: number = bytes * feePerByte;

        if (estimatedFee > actualFee) {
            return 'fee too low';
        }
        return result;
    }

    _constructTx(unspents: Array<UtxoInfo>,
        outputs: Array<TrezorJsOutputToSign>,
        fee: number): ?BuildTxPreResult {
        if (this.info == null) {
            throw new Error('Error');
        }
        const info = this.info;

        const chindex = info.changeIndex;

        const chpath = this.basePath.concat([1, chindex]);

        const outputSum: number = outputs.reduce((a, out) => a + out.value, 0);

        const utxos: ?Array<UtxoInfo> = this._selectUtxos(unspents, outputSum + fee);

        if (utxos == null) {
            return null;
        }

        const inputSum = utxos.reduce((a, utxo) => a + utxo.value, 0);

        let change = inputSum - outputSum - fee;
        let newFee = fee;

        if (change >= this.backend.coinInfo.dustLimit) {
            const newOutput = {path: chpath, value: change, segwit: this.segwit};
            outputs = outputs.concat([newOutput]);
        } else {
            change = 0;
            newFee = inputSum - outputSum;
        }

        // shuffling the outputs
        const permutation = new OutputPermutation(outputs);

        const bytesPerInput = this.segwit ? 91 : 149;
        const bytes = 10 + utxos.length * bytesPerInput + outputs.length * 35;
        const feePerKb = Math.floor((newFee) / (bytes / 1000));

        return {
            fee: newFee,
            utxos,
            outputs: permutation.shuffleOutputs(outputs),
            permutation,
            inputSum,
            bytes,
            feePerKb,
        };
    }

    // selects utxos for a tx
    // (should be sorted right, BUT this.findUnspents already sorts)
    _selectUtxos(unspents: Array<UtxoInfo>, amount: number): ?Array<UtxoInfo> {
        const utxos = unspents;

        let retval = 0;
        const ret: Array<UtxoInfo> = [];
        // select utxos from start
        utxos.forEach(utxo => {
            if (retval < amount) {
                if (utxo.value >= this.backend.coinInfo.dustLimit) { // ignore dust outputs
                    ret.push(utxo);
                    retval += utxo.value;
                }
            }
        });

        if (retval >= amount) {
            return ret;
        } else {
            return null;
        }
    }
}


let lastHeight: ?{
    timestamp: number,
    height: number,
} = null;
let currentLoadingHeight: ?Promise<number> = null;
function loadCurrentHeight(backend: BitcoreBackend): Promise<number> {
    let shouldLoad = false;
    let lastHeightH = 0;
    const now = Math.floor(Date.now() / 1000);
    if (lastHeight == null) {
        shouldLoad = true;
    } else {
        const lastTimestamp = lastHeight.timestamp;
        lastHeightH = lastHeight.height;
        shouldLoad = (now - lastTimestamp > 10 * 60 * 1000);
    }
    if (shouldLoad) {
        if (currentLoadingHeight != null) {
            return currentLoadingHeight;
        }
        currentLoadingHeight = backend.loadCurrentHeight().then(r => {
            lastHeight = {
                timestamp: now,
                height: r,
            };
            currentLoadingHeight = null;
            return r;
        });
        return currentLoadingHeight;
    } else {
        return Promise.resolve(lastHeightH);
    }
}

// Class for permutation of outputs
export class OutputPermutation {
    // Permutation is an array,
    // where on Ith position is J, which means that Jth position in the original, unsorted
    // output array
    // is Ith in the new array.
    _permutation: Array<number>;

    constructor(outputs: Array<TrezorJsOutputToSign>) {
        // I am "sorting range" - (0,1,2,3,...)
        // so I got the indexes and not the actual values inside

        // I am sorting by negative values, so I got the smaller last, bigger first
        const permutation = sortBy(range(outputs.length),
            i => [-(outputs[i].value)]);
        this._permutation = permutation;
    }

    shuffleOutputs(outputs: Array<TrezorJsOutputToSign>): Array<TrezorJsOutputToSign> {
        const shuffled = at(outputs, this._permutation);
        return shuffled;
    }

    forEach(f: (unsortedIx: number, sortedIx: number) => void) {
        this._permutation.forEach(f);
    }
}