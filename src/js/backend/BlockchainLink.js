/* @flow */

import BlockchainLink from 'trezor-blockchain-link';
/* $FlowIssue loader notation */
import RippleWorker from 'file-loader?name=ripple-worker.js!trezor-blockchain-link/workers/ripple-worker';

import { BlockchainMessage } from '../message/builder';
import * as BLOCKCHAIN from '../constants/blockchain';

import type { CoinInfo } from '../types';
import type { BlockchainBlock, BlockchainLinkTransaction } from '../types/blockchainEvent';

type Options = {
    coinInfo: CoinInfo,
    postMessage: (message: BlockchainMessage) => void,
};

const getWorker = (type: string): ?string => {
    switch (type) {
        case 'ripple':
            return RippleWorker;
        default: return null;
    }
};

export default class Blockchain {
    link: BlockchainLink;
    coinInfo: $ElementType<Options, 'coinInfo'>;
    postMessage: $ElementType<Options, 'postMessage'>;
    error: boolean;

    constructor(options: Options) {
        this.coinInfo = options.coinInfo;
        this.postMessage = options.postMessage;

        const settings = options.coinInfo.blockchainLink;
        if (!settings) {
            throw new Error('BlockchainLink settings not found in coins.json');
        }

        const worker = getWorker(settings.type);
        if (!worker) {
            throw new Error('BlockchainLink worker not found');
        }

        this.link = new BlockchainLink({
            name: this.coinInfo.shortcut,
            worker: worker,
            server: settings.url,
            debug: true,
        });
    }

    async init() {
        this.link.on('error', error => {
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
                coin: this.coinInfo,
                error: error.message,
            }));
        });

        const networkInfo = await this.link.getInfo();
        const fee = await this.link.getFee();

        this.postMessage(new BlockchainMessage(BLOCKCHAIN.CONNECT, {
            coin: this.coinInfo,
            info: {
                fee,
                ...networkInfo,
            },
        }));
    }

    async getNetworkInfo() {
        return await this.link.getInfo();
    }

    async getAccountInfo(descriptor: string, history: boolean = true) {
        return await this.link.getAccountInfo({
            descriptor,
            history,
        });
    }

    async getFee() {
        return await this.link.getFee();
    }

    async subscribe(accounts: Array<string>): Promise<void> {
        if (this.link.listenerCount('block') === 0) {
            this.link.on('block', (block: $ElementType<BlockchainBlock, 'payload'>) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.coinInfo,
                    ...block,
                }));
            });
        }

        if (this.link.listenerCount('notification') === 0) {
            this.link.on('notification', (notification: BlockchainLinkTransaction) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.NOTIFICATION, {
                    coin: this.coinInfo,
                    notification,
                }));
            });
        }

        this.link.subscribe({
            type: 'block',
        });

        this.link.subscribe({
            type: 'notification',
            addresses: accounts,
        });
    }

    async pushTransaction(tx: string): Promise<string> {
        return await this.link.pushTransaction(tx);
    }

    async disconnect() {
        this.link.disconnect();
        this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
            coin: this.coinInfo,
            error: 'Disconnected',
        }));
        remove(this); // eslint-disable-line no-use-before-define
    }
}

const instances: Array<Blockchain> = [];

const remove = (backend: Blockchain): void => {
    const index: number = instances.indexOf(backend);
    if (index >= 0) {
        instances.splice(index, 1);
    }
};

export const find = (name: string): ?Blockchain => {
    for (let i: number = 0; i < instances.length; i++) {
        if (instances[i].coinInfo.name === name) {
            if (instances[i].error) {
                remove(instances[i]);
            } else {
                return instances[i];
            }
        }
    }
    return null;
};

export const create = async (coinInfo: $ElementType<Options, 'coinInfo'>, postMessage: $ElementType<Options, 'postMessage'>): Promise<Blockchain> => {
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
