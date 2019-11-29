/* @flow */
import { Transaction as BitcoinJsTransaction } from '@trezor/utxo-lib';
import BlockchainLink from '@trezor/blockchain-link';
import { BlockchainMessage } from '../message/builder';
import * as BLOCKCHAIN from '../constants/blockchain';
import type { CoreMessage, CoinInfo } from '../types';
import type { SubscriptionAccountInfo } from '../types/params';
import type { BlockchainBlock, BlockchainLinkTransaction } from '../types/blockchainEvent';
import type { GetTransactionResponse } from '../types/transactions';

import {
    BlockbookWorker,
    RippleWorker,
} from '../env/node/workers';

import type { AccountInfoRequest } from '../types/account';

BitcoinJsTransaction.USE_STRING_VALUES = true;

type Options = {
    coinInfo: CoinInfo,
    postMessage: (message: CoreMessage) => void,
};

// duplicate from blockchain-link
type GetAccountInfo = {
    descriptor: string,
    details?: $ElementType<AccountInfoRequest, 'details'>,
    tokens?: $ElementType<AccountInfoRequest, 'tokens'>,
    page?: number, // blockbook only, page index
    pageSize?: number, // how many transactions on page
    from?: number,
    to?: number,
    contractFilter?: string, // blockbook only, ethereum token filter
    gap?: number, // blockbook only, derived addresses gap
    marker?: {
        ledger: number,
        seq: number,
    },
};

// duplicate from blockchain-link
type Fee = {
    feePerUnit: string,
    feePerTx?: string,
    feeLimit?: string,
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
            throw new Error('BlockchainLink settings not found in coins.json');
        }

        const worker = getWorker(settings.type);
        if (!worker) {
            throw new Error(`BlockchainLink worker not found ${settings.type}`);
        }

        this.link = new BlockchainLink({
            name: this.coinInfo.shortcut,
            worker: worker,
            server: settings.url,
            debug: false,
        });
    }

    onError(error: string) {
        this.link.removeAllListeners();
        this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
            coin: this.coinInfo,
            error,
        }));
        remove(this); // eslint-disable-line no-use-before-define
    }

    async init() {
        this.link.on('connected', async () => {
            const info = await this.link.getInfo();
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.CONNECT, {
                coin: this.coinInfo,
                ...info,
            }));
        });

        this.link.on('disconnected', () => {
            this.onError('Disconnected');
        });

        this.link.on('error', error => {
            this.onError(error.message);
        });

        try {
            await this.link.connect();
        } catch (error) {
            this.onError(error.message);
            throw error;
        }
    }

    async loadTransaction(id: string): Promise<BitcoinJsTransaction> {
        const transaction = await this.link.getTransaction(id);
        return BitcoinJsTransaction.fromHex(transaction.tx.hex, this.coinInfo.network);
    }

    async getTransactions(txs: string[]): Promise<GetTransactionResponse[]> {
        return Promise.all(
            txs.map(id => this.link.getTransaction(id))
        );
    }

    async getReferencedTransactions(txs: string[]): Promise<BitcoinJsTransaction[]> {
        return Promise.all(
            txs.map(id => this.loadTransaction(id))
        );
    }

    async getNetworkInfo() {
        return this.link.getInfo();
    }

    async getAccountInfo(request: GetAccountInfo) {
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

    async subscribe(accounts: SubscriptionAccountInfo[]): Promise<{ subscribed: boolean }> {
        // set block listener if it wasn't set before
        if (this.link.listenerCount('block') === 0) {
            this.link.on('block', (block: $ElementType<BlockchainBlock, 'payload'>) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.coinInfo,
                    ...block,
                }));
            });
        }

        // set notification listener if it wasn't set before
        if (this.link.listenerCount('notification') === 0) {
            this.link.on('notification', (notification: BlockchainLinkTransaction) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.NOTIFICATION, {
                    coin: this.coinInfo,
                    notification,
                }));
            });
        }

        await this.link.subscribe({ type: 'block' });

        return this.link.subscribe({
            type: 'accounts',
            accounts,
        });
    }

    async unsubscribe(accounts?: SubscriptionAccountInfo[]): Promise<any> {
        if (!accounts) {
            this.link.removeAllListeners('block');
            this.link.removeAllListeners('notification');

            // remove all subscriptions
            await this.link.unsubscribe({ type: 'block' });
            return this.link.unsubscribe({ type: 'notification' });
        }
        // unsubscribe only requested accounts
        return this.link.unsubscribe({ type: 'accounts', accounts });
    }

    async pushTransaction(tx: string): Promise<string> {
        return await this.link.pushTransaction(tx);
    }

    async disconnect() {
        this.link.removeAllListeners();
        this.link.disconnect();
        this.onError('Disconnected');
    }
}

const instances: Blockchain[] = [];

const remove = (backend: Blockchain): void => {
    const index: number = instances.indexOf(backend);
    if (index >= 0) {
        instances.splice(index, 1);
    }
};

export const find = (name: string): ?Blockchain => {
    for (let i: number = 0; i < instances.length; i++) {
        if (instances[i].coinInfo.name === name) {
            return instances[i];
        }
    }
    return null;
};

export const initBlockchain = async (coinInfo: $ElementType<Options, 'coinInfo'>, postMessage: $ElementType<Options, 'postMessage'>): Promise<Blockchain> => {
    let backend: ?Blockchain = find(coinInfo.name);
    if (!backend) {
        backend = new Blockchain({
            coinInfo,
            postMessage,
        });
        try {
            await backend.init();
        } catch (error) {
            remove(backend);
            throw error;
        }
        instances.push(backend);
    }
    return backend;
};
