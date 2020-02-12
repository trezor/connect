/* @flow */
import { BLOCKCHAIN } from '../../constants';
import type { CoinInfo } from '../networks/coinInfo';
import type { AccountAddresses, FeeLevel } from '../account';
import type { BlockbookTransaction, RippleTransaction } from './transactions';

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

// copy-paste from blockchain-link
type BlockchainLinkInput = {
    addresses: Array<string>;
    // amount: string,
    // fee: string,
    // total: string,
}

type BlockchainLinkOutput = {
    addresses: Array<string>;
    // amount: string,
}

type BlockchainLinkToken = {
    name: string;
    shortcut: string;
    value: string;
}

export type BlockchainLinkTransaction = {
    type: 'send' | 'recv';
    timestamp?: number;
    blockHeight?: number;
    blockHash?: string;
    descriptor: string;
    inputs: BlockchainLinkInput[];
    outputs: BlockchainLinkOutput[];

    hash: string;
    amount: string;
    fee: string;
    total: string;

    tokens?: BlockchainLinkToken[];
    sequence?: number; // eth: nonce || ripple: sequence
}
// copy-paste from blockchain-link end

export type BlockchainNotification = {
    coin: CoinInfo;
    notification: BlockchainLinkTransaction;
}

export type SubscriptionAccountInfo = {
    descriptor: string;
    addresses?: AccountAddresses; // bitcoin addresses
}

export type BlockchainSubscribeParams = {
    accounts: SubscriptionAccountInfo[];
    coin: string;
}

export type BlockchainSubscribeResponse = {
    subscribed: boolean;
}

export type BlockchainDisconnectParams= {
    coin: string;
}

export type BlockchainDisconnectResponse = {
    subscribed: boolean;
}

export type BlockchainGetTransactionsParams = {
    coin: string;
    txs: string[];
}

export type BlockchainGetTransactionResponse = {
    type: 'blockbook';
    tx: BlockbookTransaction;
} | {
    type: 'ripple';
    tx: RippleTransaction;
}

export type BlockchainEstimateFeeParams = {
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

export type BlockchainEstimateFeeResponse = {
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
