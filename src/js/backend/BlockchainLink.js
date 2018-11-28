/* @flow */

import BlockchainLink from 'blockchain-link';
/* $FlowIssue loader notation */
import RippleWorker from 'file-loader?name=ripple4-worker.js!blockchain-link/workers/ripple-worker';

import type { CoinInfo, EthereumNetworkInfo, MiscNetworkInfo } from 'flowtype';

type CombinedCoinInfo = CoinInfo | EthereumNetworkInfo | MiscNetworkInfo;

const instances: Array<Blockchain> = [];

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

export const create = async (coinInfo: CombinedCoinInfo): Promise<Blockchain> => {
    let backend: ?Blockchain = find(coinInfo.name);
    if (!backend) {
        backend = new Blockchain({coinInfo});
        // try {
        //     await backend.loadCoinInfo(coinInfo);
        // } catch (error) {
        //     remove(backend);
        //     throw error;
        // }
        instances.push(backend);
    }
    return backend;
};

const remove = (backend: Blockchain): void => {
    const index: number = instances.indexOf(backend);
    if (index >= 0) {
        instances.splice(index, 1);
    }
};

type Options = {
    coinInfo: CombinedCoinInfo,
};

export default class Blockchain {
    coinInfo: CombinedCoinInfo;
    error: boolean;

    constructor(options: Options) {
        this.coinInfo = options.coinInfo;

        BlockchainLink.create({
            name: this.coinInfo.shortcut,
            worker: RippleWorker,
            server: [
                'wss://s.altnet.rippletest.net',
            ],
            debug: true,
        });
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

    async subscribe(accounts: Array<string>,
        blockHandler: (hash: string, height: number) => void,
        notificationHandler: (notification: any) => void,
        errorHandler: (error: Error) => void,
    ): Promise<void> {
        const blockchain = BlockchainLink.get(this.coinInfo.shortcut);

        blockchain.on('block', blockHandler);
        blockchain.on('address', notificationHandler);
        blockchain.on('error', errorHandler);

        blockchain.subscribe({
            type: 'block',
        });

        blockchain.subscribe({
            type: 'address',
            addresses: accounts,
        });
    }

    async pushTransaction(tx: string): Promise<string> {
        const blockchain = BlockchainLink.get(this.coinInfo.shortcut);
        return await blockchain.pushTransaction(tx);
    }
}
