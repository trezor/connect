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
    coinInfo: $ElementType<Options, 'coinInfo'>;
    postMessage: $ElementType<Options, 'postMessage'>;
    error: boolean;

    constructor(options: Options) {
        this.coinInfo = options.coinInfo;
        this.postMessage = options.postMessage;

        BlockchainLink.create({
            name: this.coinInfo.shortcut,
            worker: RippleWorker,
            server: [
                'wss://s.altnet.rippletest.net',
            ],
            debug: true,
        });
    }

    async init() {
        const blockchain = BlockchainLink.get(this.coinInfo.shortcut);
        blockchain.on('error', error => {
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.ERROR, {
                coin: this.coinInfo,
                error: error.message,
            }));
        });

        const networkInfo = await blockchain.getInfo();
        const fee = await blockchain.getFee();

        this.postMessage(new BlockchainMessage(BLOCKCHAIN.CONNECT, {
            coin: this.coinInfo,
            info: {
                fee,
                ...networkInfo,
            },
        }));
    }

    async getNetworkInfo() {
        const blockchain = BlockchainLink.get(this.coinInfo.shortcut);
        return await blockchain.getInfo();
    }

    async getAccountInfo(descriptor: string) {
        const blockchain = BlockchainLink.get(this.coinInfo.shortcut);
        return await blockchain.getAccountInfo({
            descriptor,
        });
    }

    async getFee() {
        const blockchain = BlockchainLink.get(this.coinInfo.shortcut);
        return await blockchain.getFee();
    }

    async subscribe(accounts: Array<string>): Promise<void> {
        const blockchain = BlockchainLink.get(this.coinInfo.shortcut);

        blockchain.on('block', (hash, block) => {
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                coin: this.coinInfo,
                hash,
                block,
            }));
        });

        blockchain.on('notification', notification => {
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.NOTIFICATION, {
                coin: this.coinInfo,
                notification,
            }));
        });

        blockchain.subscribe({
            type: 'block',
        });

        blockchain.subscribe({
            type: 'notification',
            addresses: accounts,
        });
    }

    async pushTransaction(tx: string): Promise<string> {
        const blockchain = BlockchainLink.get(this.coinInfo.shortcut);
        return await blockchain.pushTransaction(tx);
    }
}

const instances: Array<Blockchain> = [];

const remove = (backend: Blockchain): void => {
    const index: number = instances.indexOf(backend);
    if (index >= 0) {
        instances.splice(index, 1);
    }
};

const find = (name: string): ?Blockchain => {
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
