/* @flow */
import { Transaction as BitcoinJsTransaction } from '@trezor/utxo-lib';
import BlockchainLink from '@trezor/blockchain-link';
import { BlockchainMessage } from '../message/builder';
import { BLOCKCHAIN, ERRORS } from '../constants';
import type {
    CoreMessage,
    CoinInfo,
    GetAccountInfo,
    BlockchainBlock,
    BlockchainSubscribeAccount,
    BlockchainFiatRates,
    BlockchainGetAccountBalanceHistory,
} from '../types';

import {
    BlockbookWorker,
    RippleWorker,
} from '../env/node/workers';

BitcoinJsTransaction.USE_STRING_VALUES = true;

type Options = {
    coinInfo: CoinInfo;
    postMessage: (message: CoreMessage) => void;
};

// duplicate from blockchain-link
type Fee = {
    feePerUnit: string;
    feePerTx?: string;
    feeLimit?: string;
}

const getWorker = (type: string): ?(string | () => Worker) => {
    switch (type) {
        case 'blockbook':
            return BlockbookWorker;
        case 'ripple':
            return RippleWorker;
        default: return null;
    }
};

export default class Blockchain {
    link: BlockchainLink;
    coinInfo: $ElementType<Options, 'coinInfo'>;
    postMessage: $ElementType<Options, 'postMessage'>;
    feeForBlock: Fee[] = [];
    feeTimestamp: number = 0;

    constructor(options: Options) {
        this.coinInfo = options.coinInfo;
        this.postMessage = options.postMessage;

        const settings = options.coinInfo.blockchainLink;
        if (!settings) {
            throw ERRORS.TypedError('Backend_NotSupported');
        }

        const worker = getWorker(settings.type);
        if (!worker) {
            throw ERRORS.TypedError('Backend_WorkerMissing', `BlockchainLink worker not found ${settings.type}`);
        }

        this.link = new BlockchainLink({
            name: this.coinInfo.shortcut,
            worker: worker,
            server: settings.url,
            debug: false,
        });
    }

    onError(error: ERRORS.TrezorError) {
        this.link.removeAllListeners();
        this.postMessage(BlockchainMessage(BLOCKCHAIN.ERROR, {
            coin: this.coinInfo,
            error: error.message,
            code: error.code,
        }));
        remove(this); // eslint-disable-line no-use-before-define
    }

    async init() {
        this.link.on('connected', async () => {
            const info = await this.link.getInfo();
            // There is no `rippled` setting that defines which network it uses neither mainnet or testnet
            // see: https://xrpl.org/parallel-networks.html
            const shortcut = this.coinInfo.shortcut === 'tXRP' ? 'XRP' : this.coinInfo.shortcut;
            if (info.shortcut.toLowerCase() !== shortcut.toLowerCase()) {
                this.onError(ERRORS.TypedError('Backend_Invalid'));
                return;
            }

            this.postMessage(BlockchainMessage(BLOCKCHAIN.CONNECT, {
                coin: this.coinInfo,
                ...info,
            }));
        });

        this.link.on('disconnected', () => {
            this.onError(ERRORS.TypedError('Backend_Disconnected'));
        });

        this.link.on('error', error => {
            this.onError(ERRORS.TypedError('Backend_Error', error.message));
        });

        try {
            await this.link.connect();
        } catch (error) {
            this.onError(ERRORS.TypedError('Backend_Error', error.message));
            throw error;
        }
    }

    async loadTransaction(id: string) {
        const transaction = await this.link.getTransaction(id);
        return BitcoinJsTransaction.fromHex(transaction.tx.hex, this.coinInfo.network);
    }

    async getTransactions(txs: string[]) {
        return Promise.all(
            txs.map(id => this.link.getTransaction(id))
        );
    }

    async getReferencedTransactions(txs: string[]) {
        return Promise.all(
            txs.map(id => this.loadTransaction(id))
        );
    }

    async getCurrentFiatRates(params: { currencies?: ?string[] }) {
        return this.link.getCurrentFiatRates(params);
    }

    async getFiatRatesForTimestamps(params: { timestamps?: ?number[] }) {
        return this.link.getFiatRatesForTimestamps(params);
    }

    async getAccountBalanceHistory(params: $Shape<BlockchainGetAccountBalanceHistory>) {
        return this.link.getAccountBalanceHistory(params);
    }

    async getNetworkInfo() {
        return this.link.getInfo();
    }

    async getAccountInfo(request: $Shape<GetAccountInfo>) {
        return this.link.getAccountInfo(request);
    }

    async getAccountUtxo(descriptor: string) {
        return this.link.getAccountUtxo(descriptor);
    }

    async estimateFee(request: { blocks?: number[] }) {
        const { blocks } = request;
        if (blocks) {
            const now = Date.now();
            const outdated = now - this.feeTimestamp > 20 * 60 * 1000;
            const unknownBlocks = blocks.filter(b => typeof this.feeForBlock !== 'string');
            if (!outdated && unknownBlocks.length < 1) {
                // return cached

            }
            // get new values
            const fees = await this.link.estimateFee(request);
            // cache blocks for future use
            blocks.forEach((block, index) => {
                this.feeForBlock[block] = fees[index];
            });
            this.feeTimestamp = now;
        }
        return this.link.estimateFee(request);
    }

    async subscribe(accounts?: BlockchainSubscribeAccount[]) {
        // set block listener if it wasn't set before
        if (this.link.listenerCount('block') === 0) {
            this.link.on('block', (block: BlockchainBlock) => {
                this.postMessage(BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.coinInfo,
                    ...block,
                }));
            });
        }

        // set notification listener if it wasn't set before
        if (this.link.listenerCount('notification') === 0) {
            this.link.on('notification', notification => {
                this.postMessage(BlockchainMessage(BLOCKCHAIN.NOTIFICATION, {
                    coin: this.coinInfo,
                    notification,
                }));
            });
        }

        const blockSubscription = await this.link.subscribe({ type: 'block' });
        if (!accounts) {
            return blockSubscription;
        }

        return this.link.subscribe({
            type: 'accounts',
            accounts,
        });
    }

    async subscribeFiatRates(currency?: string) {
        // set block listener if it wasn't set before
        if (this.link.listenerCount('fiatRates') === 0) {
            this.link.on('fiatRates', (res: {
                rates: BlockchainFiatRates;
            }) => {
                this.postMessage(BlockchainMessage(BLOCKCHAIN.FIAT_RATES_UPDATE, {
                    coin: this.coinInfo,
                    rates: res.rates,
                }));
            });
        }

        return this.link.subscribe({
            type: 'fiatRates',
        });
    }

    async unsubscribe(accounts?: BlockchainSubscribeAccount[]) {
        if (!accounts) {
            this.link.removeAllListeners('block');
            this.link.removeAllListeners('fiatRates');
            this.link.removeAllListeners('notification');

            // remove all subscriptions
            await this.link.unsubscribe({ type: 'fiatRates' });
            return this.link.unsubscribe({ type: 'block' });
        }
        // unsubscribe only requested accounts
        return this.link.unsubscribe({ type: 'accounts', accounts });
    }

    async unsubscribeFiatRates() {
        this.link.removeAllListeners('fiatRates');
        return this.link.unsubscribe({ type: 'fiatRates' });
    }

    async pushTransaction(tx: string) {
        return await this.link.pushTransaction(tx);
    }

    async disconnect() {
        this.link.removeAllListeners();
        this.link.disconnect();
        this.onError(ERRORS.TypedError('Backend_Disconnected'));
    }
}

const instances: Blockchain[] = [];
const customBackends: { [coin: string]: CoinInfo } = {};

export const remove = (backend: Blockchain) => {
    const index = instances.indexOf(backend);
    if (index >= 0) {
        instances.splice(index, 1);
    }
};

export const find = (name: string) => {
    for (let i = 0; i < instances.length; i++) {
        if (instances[i].coinInfo.name === name) {
            return instances[i];
        }
    }
    return null;
};

export const setCustomBackend = (coinInfo: CoinInfo, blockchainLink: $ElementType<CoinInfo, 'blockchainLink'>) => {
    if (!blockchainLink || blockchainLink.url.length === 0) {
        delete customBackends[coinInfo.shortcut];
    } else {
        customBackends[coinInfo.shortcut] = coinInfo;
        customBackends[coinInfo.shortcut].blockchainLink = blockchainLink;
    }
};

export const isBackendSupported = (coinInfo: CoinInfo) => {
    const info = customBackends[coinInfo.shortcut] || coinInfo;
    if (!info.blockchainLink) { throw ERRORS.TypedError('Backend_NotSupported'); }
};

export const initBlockchain = async (coinInfo: CoinInfo, postMessage: $ElementType<Options, 'postMessage'>) => {
    let backend = find(coinInfo.name);
    if (!backend) {
        backend = new Blockchain({
            coinInfo: customBackends[coinInfo.shortcut] || coinInfo,
            postMessage,
        });
        instances.push(backend);

        try {
            await backend.init();
        } catch (error) {
            remove(backend);
            throw error;
        }
    }
    return backend;
};
