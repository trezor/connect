/* @flow */

import BlockchainLink from 'blockchain-link';
/* $FlowIssue loader notation */
import RippleWorker from 'file-loader?name=ripple4-worker.js!blockchain-link/workers/ripple-worker';

import type { CoinInfo } from '../types';
import { BlockchainMessage } from '../message/builder';
import * as BLOCKCHAIN from '../constants/blockchain';

type Options = {
    coinInfo: CoinInfo,
    postMessage: (message: BlockchainMessage) => void,
};

export default class Blockchain {
    link: BlockchainLink;
    coinInfo: $ElementType<Options, 'coinInfo'>;
    postMessage: $ElementType<Options, 'postMessage'>;
    error: boolean;

    constructor(options: Options) {
        this.coinInfo = options.coinInfo;
        this.postMessage = options.postMessage;

        this.link = new BlockchainLink({
            name: this.coinInfo.shortcut,
            worker: RippleWorker,
            server: [
                'wss://s.altnet.rippletest.net',
            ],
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
            this.link.on('block', (data) => {
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.coinInfo,
                    ...data,
                }));
            });
        }

        if (this.link.listenerCount('notification') === 0) {
            this.link.on('notification', notification => {
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
