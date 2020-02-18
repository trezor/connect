/* @flow */
import { BLOCKCHAIN } from '../../constants';
import type { CoinInfo } from '../networks/coinInfo';
import type { AccountAddresses, AccountTransaction, FeeLevel } from '../account';
import type { BlockbookTransaction, RippleLibTransaction } from './transactions';
import type { CoreMessage } from '../params';

export type BlockchainInfo = {
    coin: CoinInfo;
    url: string;
    blockHash: string;
    blockHeight: number;
    decimals: number;
    name: string;
    shortcut: string;
    testnet: boolean;
    version: string;
    misc?: {
        reserve?: string;
    };
}

export type BlockchainBlock = {
    blockHash: string;
    blockHeight: number;
    coin: CoinInfo;
}

export type BlockchainError = {
    coin: CoinInfo;
    error: string;
}
export type BlockchainNotification = {
    coin: CoinInfo;
    notification: {
        descriptor: string;
        tx: AccountTransaction;
    };
}

export type BlockchainSubscribeAccount = {
    descriptor: string;
    addresses?: AccountAddresses; // bitcoin addresses
}

export type BlockchainSubscribe = {
    accounts: BlockchainSubscribeAccount[];
    coin: string;
}

export type BlockchainSubscribed = {
    subscribed: boolean;
}

export type BlockchainDisconnect = {
    coin: string;
}

export type BlockchainDisconnected = {
    disconnected: boolean;
}

export type BlockchainGetTransactions = {
    coin: string;
    txs: string[];
}

export type BlockchainTransactions = Array<{
    type: 'blockbook';
    tx: BlockbookTransaction;
} | {
    type: 'ripple';
    tx: RippleLibTransaction;
}>;

export type BlockchainEstimateFee = {
    coin: string;
    request?: {
        blocks?: number[];
        specific?: {
            conservative?: boolean;
            data?: string;
            from?: string;
            to?: string;
            txsize?: number;
        };
        feeLevels?: 'preloaded' | 'smart';
    };
}

export type BlockchainEstimatedFee = {
    blockTime: number;
    minFee: number;
    maxFee: number;
    levels: FeeLevel[];
}

export type BlockchainEvent =
| {
    type: typeof BLOCKCHAIN.CONNECT;
    payload: BlockchainInfo;
}
| {
    type: typeof BLOCKCHAIN.ERROR;
    payload: BlockchainError;
}
| {
    type: typeof BLOCKCHAIN.BLOCK;
    payload: BlockchainBlock;
}
| {
    type: typeof BLOCKCHAIN.NOTIFICATION;
    payload: BlockchainNotification;
};

export interface BlockchainMessageBuilder {
    (type: typeof BLOCKCHAIN.CONNECT, payload: BlockchainInfo): CoreMessage;
    (type: typeof BLOCKCHAIN.BLOCK, payload: BlockchainBlock): CoreMessage;
    (type: typeof BLOCKCHAIN.NOTIFICATION, payload: BlockchainNotification): CoreMessage;
    (type: typeof BLOCKCHAIN.ERROR, payload: BlockchainError): CoreMessage;
}
