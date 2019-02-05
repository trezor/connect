/* @flow */

import * as BLOCKCHAIN from '../constants/blockchain';
import type { CoreMessage } from './index';
import type { CoinInfo } from './coinInfo';

export type BlockchainConnect = {
    type: typeof BLOCKCHAIN.CONNECT,
    payload: {
        coin: CoinInfo,
        info: {
            block: number,
        },
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
        block: number,
        hash: string,
    },
}

export type BlockchainNotification = {
    type: typeof BLOCKCHAIN.NOTIFICATION,
    payload: {
        coin: CoinInfo,
        notification: any, // TODO: blockchain-link
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
