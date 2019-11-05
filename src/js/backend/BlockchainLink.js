/* @flow */
import BlockchainLink from '@trezor/blockchain-link';
import { BlockchainMessage } from '../message/builder';
import * as BLOCKCHAIN from '../constants/blockchain';
import type { CoreMessage, CoinInfo } from '../types';
// import type { BlockchainBlock, BlockchainLinkTransaction } from '../../../types/blockchainEvent';
// import type { GetAccountInfoOptions, EstimateFeeOptions } from 'trezor-blockchain-link';

// nodejs-replace-start
/* $FlowIssue loader notation */
import RippleWorker from 'worker-loader?name=js/ripple-worker.js!@trezor/blockchain-link/lib/workers/ripple/index.js';
// nodejs-replace-end
/* nodejs-imports-start
import TinyWorker from 'tiny-worker';
import path from 'path';
const RippleWorker = () => { return new TinyWorker(path.resolve(global.TREZOR_CONNECT_ASSETS, './workers/ripple-worker.js')) };
nodejs-imports-end */

type Options = {
    coinInfo: CoinInfo,
    postMessage: (message: CoreMessage) => void,
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
    currentBlockHeight: number = 0;
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
            this.currentBlockHeight = info.blockHeight;
            this.postMessage(new BlockchainMessage(BLOCKCHAIN.CONNECT, {
                coin: this.coinInfo,
                info: {
                    block: info.blockHeight,
                },
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

    async getNetworkInfo() {
        return await this.link.getInfo();
    }

    async getAccountInfo(descriptor: string, options?: any) {
        const info = await this.link.getAccountInfo({
            descriptor,
        });

        return {
            ...info,
            ...info.misc,
            block: this.currentBlockHeight,
            transactions: [],
        };
    }

    async estimateFee(options?: any) {
        // since new @trezor/blockchain-link Fee response has different format
        // this method is used only with XRP so we can assume that there is only 1 feeLevel
        const levels = await this.link.estimateFee();
        return [
            {
                name: 'Normal',
                value: levels[0].feePerUnit,
            },
        ];
    }

    async subscribe(accounts: Array<string>) {
        if (this.link.listenerCount('block') === 0) {
            this.link.on('block', (info: { blockHeight: number, blockHash: string }) => {
                // since new @trezor/blockchain-link Block event has different format
                this.currentBlockHeight = info.blockHeight;
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.coinInfo,
                    block: info.blockHeight,
                    hash: info.blockHash,
                }));
            });
        }

        if (this.link.listenerCount('notification') === 0) {
            this.link.on('notification', (notification: any) => {
                const { descriptor, tx } = notification;
                // since new @trezor/blockchain-link Transaction event has different format
                this.postMessage(new BlockchainMessage(BLOCKCHAIN.NOTIFICATION, {
                    coin: this.coinInfo,
                    notification: {
                        type: tx.type,
                        timestamp: tx.blockTime,
                        blockHeight: tx.blockHeight,
                        blockHash: tx.blockHash,
                        descriptor,
                        inputs: tx.targets,
                        outputs: tx.targets,
                        hash: tx.txid,
                        amount: tx.amount,
                        fee: tx.fee,
                        total: tx.amount,
                    },
                }));
            });
        }

        await this.link.subscribe({
            type: 'block',
        });

        return this.link.subscribe({
            type: 'addresses',
            addresses: accounts,
        });
    }

    async pushTransaction(tx: string) {
        return await this.link.pushTransaction(tx);
    }

    async disconnect() {
        this.link.disconnect();
        this.onError('Disconnected');
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
