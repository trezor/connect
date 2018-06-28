/* @flow */
'use strict';

import {
    BitcoreBlockchain,
    WorkerDiscovery,
} from 'hd-wallet';

import type {
    Stream,
    Discovery,
    AccountInfo,
    AccountLoadStatus,
} from 'hd-wallet';

import {
    Transaction as BitcoinJsTransaction,
} from 'bitcoinjs-lib-zcash';

import { getCoinInfoByHash, getCoinInfoByCurrency } from '../data/CoinInfo';
import type { CoinInfo } from 'flowtype';

import { httpRequest } from '../utils/networkUtils';

/* $FlowIssue loader notation */
import FastXpubWasm from 'hd-wallet/lib/fastxpub/fastxpub.wasm';
/* $FlowIssue loader notation */
import FastXpubWorker from 'worker-loader?name=js/fastxpub-worker.[hash].js!hd-wallet/lib/fastxpub/fastxpub.js';
/* $FlowIssue loader notation */
import DiscoveryWorker from 'worker-loader?name=js/discovery-worker.[hash].js!hd-wallet/lib/discovery/worker/inside';
/* $FlowIssue loader notation */
import SocketWorker from 'worker-loader?name=js/socketio-worker.[hash].js!hd-wallet/lib/socketio-worker/inside';

export type Options = {
    bitcoreURL: Array<string>,
    coinInfo?: CoinInfo,
};

export default class BlockBook {
    options: Options;
    blockchain: BitcoreBlockchain;

    lastError: boolean;
    discovery: Discovery;

    constructor(options: Options) {
        this.options = options;

        const worker: FastXpubWorker = new FastXpubWorker();
        const blockchain: BitcoreBlockchain = new BitcoreBlockchain(this.options.bitcoreURL, () => new SocketWorker());
        this.blockchain = blockchain;

        // this.lastError = false;

        // // $FlowIssue WebAssembly
        const filePromise = typeof WebAssembly !== 'undefined' ? httpRequest(FastXpubWasm, 'binary') : Promise.reject();


        this.blockchain.errors.values.attach(() => { this._setError(); });
        this.discovery = new WorkerDiscovery(
            () => new DiscoveryWorker(),
            worker,
            filePromise,
            this.blockchain
        );
    }

    _setError() {
        this.lastError = true;
    }

    async loadCoinInfo(coinInfo: ?CoinInfo): Promise<void> {
        const socket: any = await this.blockchain.socket.promise; // socket from hd-wallet TODO: type
        const networkInfo: any = await socket.send({ method: 'getInfo', params: [] }); // TODO: what type is it?

        if (!coinInfo) {
            const hash: string = await this.blockchain.lookupBlockHash(0);
            coinInfo = getCoinInfoByHash(hash, networkInfo);
            if (!coinInfo) {
                throw new Error('Failed to load coinInfo ' + hash);
            }
        }

        // set vars
        this.blockchain.zcash = coinInfo.zcash;
    }

    async loadAccountInfo(
        xpub: string,
        data: ?AccountInfo,
        coinInfo: CoinInfo,
        progress: (progress: AccountLoadStatus) => void,
        setDisposer: (disposer: () => void) => void
    ): Promise<AccountInfo> {

        const segwit_s: 'p2sh' | 'off' = coinInfo.segwit ? 'p2sh' : 'off';

        const discovery = this.discovery.discoverAccount(data, xpub, coinInfo.network, segwit_s, !!(coinInfo.cashAddrPrefix));
        setDisposer(() => discovery.dispose(new Error('Interrupted by user')));

        discovery.stream.values.attach(status => {
            progress(status);
        });

        // discovery.stream.

        this.blockchain.errors.values.attach((e) => {
            discovery.dispose(e);
            throw e;
        });

        const info: AccountInfo = await discovery.ending;
        discovery.stream.dispose();

        return info;
    }

    monitorAccountActivity(
        xpub: string,
        data: AccountInfo,
        coinInfo: CoinInfo,
    ): Stream<AccountInfo | Error> {
        const segwit_s = coinInfo.segwit ? 'p2sh' : 'off';
        const res = this.discovery.monitorAccountActivity(data, xpub, coinInfo.network, segwit_s, !!(coinInfo.cashAddrPrefix));

        this.blockchain.errors.values.attach(() => {
            res.dispose();
        });
        return res;
    }

    async loadTransactions(txs: Array<string>): Promise<Array<BitcoinJsTransaction>> {
        return Promise.all(
            txs.map(id => this.loadTransaction(id))
        );
    }

    async loadTransaction(id: string): Promise<BitcoinJsTransaction> {
        const tx = await this.blockchain.lookupTransaction(id);
        return BitcoinJsTransaction.fromHex(tx.hex, tx.zcash);
    }

    async loadCurrentHeight(): Promise<number> {
        const { height } = await this.blockchain.lookupSyncStatus();
        return height;
    }

    async sendTransaction(txBytes: Buffer): Promise<string> {
        return await this.blockchain.sendTransaction(txBytes.toString('hex'));
    }

    async sendTransactionHex(txHex: string): Promise<string> {
        return await this.blockchain.sendTransaction(txHex);
    }

    dispose() {
        // TODO!
    }
}
