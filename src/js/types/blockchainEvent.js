/* @flow */

import * as BLOCKCHAIN from '../constants/blockchain';
import type { CoreMessage } from './index';

export type BlockchainConnect = {
    type: typeof BLOCKCHAIN.CONNECT,
    payload: {
        coin: any,
        info: {
            fee: string,
            block: number,
        },
    },
}

export type BlockchainError = {
    type: typeof BLOCKCHAIN.ERROR,
    payload: {
        error: string,
        coin: any,
    },
}

export type BlockchainBlock = {
    type: typeof BLOCKCHAIN.BLOCK,
    payload: {
        coin: any,
        block: number,
        hash: string,
    },
}

export type BlockchainNotification = {
    type: typeof BLOCKCHAIN.NOTIFICATION,
    payload: {
        notification: any, // TODO: specify notification type
        coin: any,
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
