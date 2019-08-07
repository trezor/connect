/* @flow */

// Transaction object
type TokenTransfer = {
    type: 'sent' | 'recv' | 'self' | 'unknown',
    name: string,
    symbol: string,
    address: string,
    decimals: number,
    amount: string,
    from?: string,
    to?: string,
};

// Transaction object
type TransactionTarget = {
    addresses?: string[],
    isAddress: boolean,
    amount?: string,
    coinbase?: string,
};

export type AccountTransaction = {
    type: 'sent' | 'recv' | 'self' | 'unknown',

    txid: string,
    blockTime?: number,
    blockHeight?: number,
    blockHash?: string,

    amount: string,
    fee?: string,
    total?: string, // amount + total

    targets: TransactionTarget[],
    tokens: TokenTransfer[],
    rbf?: boolean,
    ethereumSpecific?: {
        status: number,
        nonce: number,
        gasLimit: number,
        gasUsed?: number,
        gasPrice: string,
    },
};

type TokenInfo = {
    type: string, // token type: ERC20...
    address: string, // token address
    balance: string, // token balance
    name: string, // token name
    symbol: string, // token symbol
    decimals: number, //
    // transfers: number, // total transactions?
};

type Address = {
    address: string,
    path: string,
    transfers: number,
    balance?: string,
    sent?: string,
    received?: string,
};

export type AccountAddresses = {
    change: Address[],
    used: Address[],
    unused: Address[],
};

export type AccountUtxo = {
    txid: string,
    vout: number,
    amount: string,
    blockHeight: number,
    address: string,
    path: string,
    confirmations: number,
    coinbase?: boolean,
}

export type AccountInfo = {
    empty: boolean,
    path: string,
    descriptor: string, // address or xpub
    balance: string,
    availableBalance: string,
    tokens?: TokenInfo[], // ethereum tokens
    addresses?: AccountAddresses, // bitcoin addresses
    utxo?: AccountUtxo[], // bitcoin utxo
    history: {
        total: number, // total transactions (unknown in ripple)
        tokens?: number, // tokens transactions (unknown in ripple)
        unconfirmed?: number, // unconfirmed transactions (unknown in ripple)
        transactions?: AccountTransaction[], // list of transactions
        txids?: string[], // not implemented
    },
    misc?: {
        // ETH
        nonce?: string,
        // XRP
        sequence?: number,
        reserve?: string,
    },
    page?: {
        // blockbook
        index: number,
        size: number,
        total: number,
    },
    marker?: {
        // ripple-lib
        ledger: number,
        seq: number,
    },
}

export type AccountInfoRequest = {
    coin: string,
    path?: string,
    descriptor?: string,
    details?: 'basic' | 'tokens' | 'tokenBalances' | 'txids' | 'txs',
    tokens?: 'nonzero' | 'used' | 'derived',
    page?: number,
    pageSize?: number,
    from?: number,
    to?: number,
    contractFilter?: string,
    gap?: number,
    marker?: {
        ledger: number,
        seq: number,
    },
};

export type DiscoveryAccountType = 'normal' | 'segwit' | 'legacy';

export type DiscoveryAccount = {
    type: DiscoveryAccountType,
    label: string,
    descriptor: string,
    address_n: number[],
    empty?: boolean,
    balance?: string,
    addresses?: AccountAddresses,
}
