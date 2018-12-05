/* @flow */

import BlockchainLink from 'blockchain-link';
/* $FlowIssue loader notation */
import RippleWorker from 'file-loader?name=ripple4-worker.js!blockchain-link/workers/ripple-worker';

import type { CoinInfo } from '../types';
import { BlockchainMessage } from '../message/builder';
import * as BLOCKCHAIN from '../constants/blockchain';

import { Blockchain as BlockchainInstance } from 'blockchain-link';

type Options = {
    coinInfo: CoinInfo,
    postMessage: (message: BlockchainMessage) => void,
};

export default class Blockchain {
    blockchain: BlockchainInstance<any>;
    coinInfo: $ElementType<Options, 'coinInfo'>;
    postMessage: $ElementType<Options, 'postMessage'>;
    error: boolean;

    constructor(options: Options) {
        this.coinInfo = options.coinInfo;
        this.postMessage = options.postMessage;

        this.blockchain = BlockchainLink.create({
            name: this.coinInfo.shortcut,
            worker: RippleWorker,
            server: [
                'wss://s.altnet.rippletest.net',
            ],
            debug: true,
        });
    }

    async init() {
        this.blockchain.on('error', error => {
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
                coin: this.coinInfo,
                error: error.message,
            }));
        });

        const networkInfo = await this.blockchain.getInfo();
        const fee = await this.blockchain.getFee();

        this.postMessage(new BlockchainMessage(BLOCKCHAIN.CONNECT, {
            coin: this.coinInfo,
            info: {
                fee,
                ...networkInfo,
            },
        }));
    }

    async getNetworkInfo() {
        return await this.blockchain.getInfo();
    }

    async getAccountInfo(descriptor: string, history: ?boolean) {
        return await this.blockchain.getAccountInfo({
            descriptor,
            history,
        });
    }

    async getFee() {
        return await this.blockchain.getFee();
    }

    async subscribe(accounts: Array<string>): Promise<void> {
        if (this.blockchain.listenerCount('block') === 0) {
            this.blockchain.on('block', (data) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.coinInfo,
                    ...data,
                }));
            });
        }

        if (this.blockchain.listenerCount('notification') === 0) {
            this.blockchain.on('notification', notification => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.NOTIFICATION, {
                    coin: this.coinInfo,
                    notification,
                }));
            });
        }

        this.blockchain.subscribe({
            type: 'block',
        });

        this.blockchain.subscribe({
            type: 'notification',
            addresses: accounts,
        });
    }

    async pushTransaction(tx: string): Promise<string> {
        return await this.blockchain.pushTransaction(tx);
    }

    async disconnect() {
        this.blockchain.disconnect();
        this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
            coin: this.coinInfo,
            error: 'Disconnected',
        }));
        remove(this);
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
