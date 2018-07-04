/* @flow */
'use strict';

import {
    BitcoreBlockchain,
    WorkerChannel,
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

//import { getBitcoreServer, splitUrls } from '../common/SettingsService';
import { waitForCoinInfo } from './CoinInfo';
import type { CoinInfo } from './CoinInfo';

const getBitcoreServer = {};
const splitUrls = {};
let coinInfo: ?CoinInfo;

export type Options = {
    bitcoreURL: Array<string>,
};

export type AccountProgress = {
    loadingFromStorage: boolean,
    loadedFromStorage: number,
    willLoadFromStorage: number,
    transactions: number,
    addresses: number,
    willSaveToStorage: number,
    savingToStorage: boolean,
    savedToStorage: number,
    analysing?: ?boolean,
};


function createSocketWorker(): Worker {
    return new Worker('./js/socket-worker-dist.js');
}

function createDiscoveryWorker(): Worker {
    return new Worker('./js/discovery-worker-dist.js');
}

// this gets compiled or something by emscripten, not sure where from
const trezorCryptoURL = './js/trezor-crypto-dist.js';

export const create = (urls): Promise<void> => {
    let b = new BitcoreBackend({ bitcoreURL: urls });
    return waitForCoinInfo(b.blockchain).then(ci => {
        coinInfo = ci;
        b.setCoinInfo(ci);
        return b;
    });
}

export default class BitcoreBackend {
    options: Options;
    worker: Worker;
    channel: WorkerChannel;
    blockchain: BitcoreBlockchain;

    lastError: boolean;

    coinInfo: ?CoinInfo;
    discovery: Discovery;

    constructor(options: Options) {
        this.options = options;

        this.worker = new Worker(trezorCryptoURL);
        this.channel = new WorkerChannel(this.worker);
        const blockchain: BitcoreBlockchain = new BitcoreBlockchain(this.options.bitcoreURL, () => createSocketWorker());
        this.blockchain = blockchain;

        this.lastError = false;

        this.blockchain.errors.values.attach(() => { this._setError(); });
        this.discovery = new WorkerDiscovery(
            () => createDiscoveryWorker(),
            this.channel,
            this.blockchain
        );
    }

    _setError() {
        this.lastError = true;
    }

    setCoinInfo(coinInfo: ?CoinInfo) {
        this.coinInfo = coinInfo;
        if (coinInfo != null) {
            this.blockchain.zcash = coinInfo.zcash;
        }
    }

    loadAccountInfo(
        xpub: string,
        data: ?AccountInfo,
        progress: (progress: AccountLoadStatus) => void,
        setDisposer: (disposer: () => void) => void,
        segwit: boolean,
        gap?: number
    ): Promise<AccountInfo> {
        if (this.coinInfo == null) {
            return Promise.reject(new Error('Address version not set.'));
        }
        const segwit_s = segwit ? 'p2sh' : 'off';

        const discovery = this.discovery.discoverAccount(data, xpub, this.coinInfo.network, segwit_s, gap);

        this.blockchain.errors.values.attach((e) => {
            discovery.dispose(e);
        });

        discovery.stream.values.attach(status => {
            progress(status);
        });

        setDisposer(() => discovery.dispose(new Error('Interrupted by user')));

        return discovery.ending;
    }

    monitorAccountActivity(
        xpub: string,
        data: AccountInfo,
        segwit: boolean
    ): Stream<AccountInfo | Error> {
        if (this.coinInfo == null) {
            throw new Error('Address version not set.');
        }
        const segwit_s = segwit ? 'p2sh' : 'off';
        const res = this.discovery.monitorAccountActivity(data, xpub, this.coinInfo.network, segwit_s);

        this.blockchain.errors.values.attach(() => {
            res.dispose();
        });
        return res;
    }

    loadTransaction(account: AccountInfo, id: string): Promise<BitcoinJsTransaction> {
        return this.blockchain.lookupTransaction(id).then((tx) => {
            return BitcoinJsTransaction.fromHex(tx.hex, tx.zcash);
        });
    }

    loadCurrentHeight(): Promise<number> {
        return this.blockchain.lookupSyncStatus().then(({height}) => height);
    }

    sendTransaction(txBytes: Buffer): Promise<any> {
        return this.blockchain.sendTransaction(txBytes.toString('hex'));
    }

    sendTransactionHex(txHex: string): Promise<any> {
        return this.blockchain.sendTransaction(txHex);
    }

    isConnected(): boolean {
        return this.lastError;
        // return this.blockchain.socket.socket.connected();
    }

    storeAccountInfo(account: AccountInfo): AccountInfo {
        throw new Error('Not yet implemented.');
    }

    hasError(): boolean {
        return this.lastError;
    }
}
