/* @flow */

import * as BLOCKCHAIN from '../constants/blockchain';
import type { CoreMessage } from './index';
import type { CoinInfo, EthereumNetworkInfo } from 'flowtype';

type BlockchainBlock = {
    +type: typeof BLOCKCHAIN.BLOCK,
    +payload: {
        hash: string,
        height: number,
        coin: CoinInfo | EthereumNetworkInfo,
    },
}

type BlockchainNotification = {
    +type: typeof BLOCKCHAIN.NOTIFICATION,
    +payload: {
        notification: any, // TODO: specify notification type
        coin: CoinInfo | EthereumNetworkInfo,
    },
}

type BlockchainConnect = {
    +type: typeof BLOCKCHAIN.CONNECT,
    +payload: {
        coin: CoinInfo | EthereumNetworkInfo,
    },
}

type BlockchainError = {
    +type: typeof BLOCKCHAIN.ERROR,
    +payload: {
        error: string,
        coin: CoinInfo | EthereumNetworkInfo,
    },
}

/* eslint-disable no-redeclare */
declare function MessageFactory(type: $PropertyType<BlockchainBlock, 'type'>, payload: $PropertyType<BlockchainBlock, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BlockchainNotification, 'type'>, payload: $PropertyType<BlockchainNotification, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BlockchainConnect, 'type'>, payload: $PropertyType<BlockchainConnect, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<BlockchainError, 'type'>, payload: $PropertyType<BlockchainError, 'payload'>): CoreMessage;
/* eslint-enable no-redeclare */

export type BlockchainMessageFactory = typeof MessageFactory;
