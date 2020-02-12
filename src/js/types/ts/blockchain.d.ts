/* @flow */
// import { BLOCKCHAIN } from '../../constants';
import { CoinInfo } from './coinInfo';
import { AccountAddresses } from './account';

export interface BlockchainInfo {
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

export interface BlockchainBlock {
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

export interface BlockchainSubscribeParams {
    accounts: {
        descriptor: string;
        addresses?: AccountAddresses;
    }[];
    coin: string;
}

export interface BlockchainSubscribeResponse {
    subscribed: boolean;
}

export interface BlockchainEstimateFeeParams {
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

export interface FeeLevel {
    label: 'high' | 'normal' | 'economy' | 'low' | 'custom';
    feePerUnit: string;
    blocks: number;
    feeLimit?: string; // eth gas limit
    feePerTx?: string; // fee for BlockchainEstimateFeeParams.request.specific
}

export interface BlockchainEstimateFeeResponse {
    blockTime: number;
    minFee: number;
    maxFee: number;
    levels: FeeLevel[];
}

export type BlockchainParams = {
    disconnect: { coin: string };
    estimateFee: BlockchainEstimateFeeParams;
    getTransactions: {
        coin: string;
        txs: string[];
    };
    subscribe: BlockchainSubscribeParams;
    unsubscribe: BlockchainSubscribeParams;
}

export type BlockchainResponses = {
    disconnect: any;
    estimateFee: true;
    getTransactions: any;
    subscribe: BlockchainSubscribeParams;
    unsubscribe: BlockchainSubscribeParams;
}
