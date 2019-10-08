/* @flow */

import * as BLOCKCHAIN from '../constants/blockchain';
import type { CoreMessage } from './index';
import type { CoinInfo } from './coinInfo';

export type BlockchainConnect = {
    type: typeof BLOCKCHAIN.CONNECT,
    payload: {
        coin: CoinInfo,
        url: string,
        blockHash: string,
        blockHeight: number,
        decimals: number,
        name: string,
        shortcut: string,
        testnet: boolean,
        version: string,
    },
}

export type BlockchainError = {
    type: typeof BLOCKCHAIN.ERROR,
    payload: {
        coin: CoinInfo,
        error: string,
    },
}

export type BlockchainBlock = {
    type: typeof BLOCKCHAIN.BLOCK,
    payload: {
        coin: CoinInfo,
        blockHash: string,
        blockHeight: number,
    },
}

// copy-paste from blockchain-link
type BlockchainLinkInput = {
    addresses: Array<string>,
    // amount: string,
    // fee: string,
    // total: string,
}

type BlockchainLinkOutput = {
    addresses: Array<string>,
    // amount: string,
}

type BlockchainLinkToken = {
    name: string,
    shortcut: string,
    value: string,
}

export type BlockchainLinkTransaction = {
    type: 'send' | 'recv',
    timestamp: ?number,
    blockHeight: ?number,
    blockHash: ?string,
    descriptor: string,
    inputs: Array<BlockchainLinkInput>,
    outputs: Array<BlockchainLinkOutput>,

    hash: string,
    amount: string,
    fee: string,
    total: string,

    tokens?: Array<BlockchainLinkToken>,
    sequence?: number, // eth: nonce || ripple: sequence
}
// copy-paste from blockchain-link end

export type BlockchainNotification = {
    type: typeof BLOCKCHAIN.NOTIFICATION,
    payload: {
        coin: CoinInfo,
        notification: BlockchainLinkTransaction,
    },
}

export type BlockchainEvent = BlockchainConnect | BlockchainError | BlockchainBlock | BlockchainNotification;

/* eslint-disable no-redeclare */
declare function MessageFactory(type: $PropertyType<BlockchainBlock, 'type'>, payload: $PropertyType<BlockchainBlock, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BlockchainNotification, 'type'>, payload: $PropertyType<BlockchainNotification, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BlockchainConnect, 'type'>, payload: $PropertyType<BlockchainConnect, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BlockchainError, 'type'>, payload: $PropertyType<BlockchainError, 'payload'>): CoreMessage;
/* eslint-enable no-redeclare */

export type BlockchainMessageFactory = typeof MessageFactory;
