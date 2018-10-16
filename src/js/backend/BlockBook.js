/* @flow */
'use strict';

import {
    BitcoreBlockchain,
    WorkerDiscovery,
} from 'hd-wallet';
import { Transaction as BitcoinJsTransaction } from 'bitcoinjs-lib-zcash';

import * as ERROR from '../constants/errors';
import { getCoinInfoByHash } from '../data/CoinInfo';
import { httpRequest } from '../utils/networkUtils';

import type {
    Stream,
    Discovery,
    AccountInfo,
    AccountLoadStatus,
} from 'hd-wallet';
import type { CoinInfo, EthereumNetworkInfo } from 'flowtype';

/* $FlowIssue loader notation */
import FastXpubWasm from 'hd-wallet/lib/fastxpub/fastxpub.wasm';
/* $FlowIssue loader notation */
import FastXpubWorker from 'worker-loader?name=js/fastxpub-worker.[hash].js!hd-wallet/lib/fastxpub/fastxpub.js';
/* $FlowIssue loader notation */
import DiscoveryWorker from 'worker-loader?name=js/discovery-worker.[hash].js!hd-wallet/lib/discovery/worker/inside';
/* $FlowIssue loader notation */
import SocketWorker from 'worker-loader?name=js/socketio-worker.[hash].js!hd-wallet/lib/socketio-worker/inside';

export type Options = {
    urls: Array<string>,
    coinInfo: CoinInfo | EthereumNetworkInfo,
};

export default class BlockBook {
    options: Options;
    blockchain: BitcoreBlockchain;

    error: ?Error;
    discovery: Discovery;

    constructor(options: Options) {
        if (options.urls.length < 1) {
            throw ERROR.BACKEND_NO_URL;
        }
        this.options = options;

        const worker: FastXpubWorker = new FastXpubWorker();
        const blockchain: BitcoreBlockchain = new BitcoreBlockchain(this.options.urls, () => new SocketWorker());
        this.blockchain = blockchain;

        // // $FlowIssue WebAssembly
        const filePromise = typeof WebAssembly !== 'undefined' ? httpRequest(FastXpubWasm, 'binary') : Promise.reject();

        // this.blockchain.errors.values.attach(() => { this._setError(); });
        this.blockchain.errors.values.attach(this._setError.bind(this));
        this.discovery = new WorkerDiscovery(
            () => new DiscoveryWorker(),
            worker,
            filePromise,
            this.blockchain
        );
    }

    _setError(error: Error) {
        this.error = error;
        this.subscribed = false;
        // TODO: remove all stream listeners
        // this instance will not be used anymore
    }

    async loadCoinInfo(coinInfo: ?(CoinInfo | EthereumNetworkInfo)): Promise<void> {
        const socket = await this.blockchain.socket.promise;
        const networkInfo = await socket.send({ method: 'getInfo', params: [] });

        if (!coinInfo) {
            const hash: string = await this.blockchain.lookupBlockHash(0);
            coinInfo = getCoinInfoByHash(hash, networkInfo);
            if (!coinInfo) {
                throw new Error('Failed to load coinInfo ' + hash);
            }
        }

        // set vars
        if (typeof coinInfo.zcash === 'boolean') {
            this.blockchain.zcash = coinInfo.zcash;
        }
    }

    async loadAccountInfo(
        xpub: string,
        data: ?AccountInfo,
        coinInfo: CoinInfo,
        progress: (progress: AccountLoadStatus) => void,
        setDisposer: (disposer: () => void) => void
    ): Promise<AccountInfo> {
        if (this.error) { throw this.error; }

        const segwit_s: 'p2sh' | 'off' = coinInfo.segwit ? 'p2sh' : 'off';

        const discovery = this.discovery.discoverAccount(data, xpub, coinInfo.network, segwit_s, !!(coinInfo.cashAddrPrefix));
        setDisposer(() => discovery.dispose(new Error('Interrupted by user')));

        discovery.stream.values.attach(status => {
            progress(status);
        });

        this.blockchain.errors.values.attach((e) => {
            discovery.dispose(e);
        });

        const info: AccountInfo = await discovery.ending;
        discovery.stream.dispose();

        return info;
    }

    subscribed: boolean = false;

    subscribe(accounts: Array<string>,
        blockHandler: (hash: string, height: number) => void,
        notificationHandler: (notification: any) => void,
        errorHandler: (error: Error) => void,
    ): void {
        if (!this.subscribed) {
            this.subscribed = true;

            this.blockchain.blocks.values.attach(hash => {
                const asyncFN = async (hash) => {
                    const { height } = await this.blockchain.lookupSyncStatus();
                    blockHandler(hash, height);
                };
                if (typeof hash === 'string') {
                    asyncFN(hash);
                }
            });

            this.blockchain.notifications.values.attach(notificationHandler);
            this.blockchain.errors.values.attach(errorHandler);
        }

        // TODO: verify address duplicates
        // TODO: add option to remove subscription
        // this.blockchain.subscribe(new Set(accounts));
    }

    monitorAccountActivity(
        xpub: string,
        data: AccountInfo,
        coinInfo: CoinInfo,
    ): Stream<AccountInfo | Error> {
        if (this.error) { throw this.error; }

        const segwit_s = coinInfo.segwit ? 'p2sh' : 'off';
        const res = this.discovery.monitorAccountActivity(data, xpub, coinInfo.network, segwit_s, !!(coinInfo.cashAddrPrefix));

        this.blockchain.errors.values.attach(() => {
            res.dispose();
        });
        return res;
    }

    async loadTransactions(txs: Array<string>): Promise<Array<BitcoinJsTransaction>> {
        if (this.error) { throw this.error; }

        return Promise.all(
            txs.map(id => this.loadTransaction(id))
        );
    }

    async loadTransaction(id: string): Promise<BitcoinJsTransaction> {
        if (this.error) { throw this.error; }
        const tx = await this.blockchain.lookupTransaction(id);
        return BitcoinJsTransaction.fromHex(tx.hex, tx.zcash);
    }

    async loadCurrentHeight(): Promise<number> {
        if (this.error) { throw this.error; }
        const { height } = await this.blockchain.lookupSyncStatus();
        return height;
    }

    async sendTransaction(txBytes: Buffer): Promise<string> {
        if (this.error) { throw this.error; }
        return await this.blockchain.sendTransaction(txBytes.toString('hex'));
    }

    async sendTransactionHex(txHex: string): Promise<string> {
        if (this.error) { throw this.error; }
        return await this.blockchain.sendTransaction(txHex);
    }

    dispose() {

    }
}
