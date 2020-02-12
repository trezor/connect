/* @flow */

// copy-paste from blockchain-link

export type VinVout = {
    n: number;
    addresses?: string[];
    isAddress: boolean;
    value?: string;
    coinbase?: string;
    txid?: string;
    vout?: number;
    sequence?: number;
    hex?: string;
}

export type BlockbookTransaction = {
    txid: string;
    version?: number;
    vin: VinVout[];
    vout: VinVout[];
    blockHeight: number;
    blockHash?: string;
    confirmations: number;
    blockTime: number;
    value: string;
    valueIn: string;
    fees: string;
    hex: string;
    ethereumSpecific?: {
        status: number;
        nonce: number;
        gasLimit: number;
        gasUsed?: number;
        gasPrice: string;
    };
    tokenTransfers?: {
        from?: string;
        to?: string;
        value: string;
        token: string;
        name: string;
        symbol: string;
        decimals?: number;
    }[];
}

// ripple-lib

type RippleAmount = {
    value: string;
    currency: string;
    issuer?: string;
    counterparty?: string;
}

type RippleAdjustment = {
    address: string;
    amount: RippleAmount;
    tag?: number;
}

type RippleMemo = {
    type?: string;
    format?: string;
    data?: string;
}

type RippleOutcome = {
    result: string;
    ledgerVersion: number;
    indexInLedger: number;
    fee: string;
    balanceChanges: {
        [key: string]: RippleAmount[];
    };
    orderbookChanges: any;
    timestamp?: string;
}

export type RippleTransaction = {
    type: string;
    specification: {
        source: RippleAdjustment;
        destination: RippleAdjustment;
        paths?: string;
        memos?: RippleMemo[];
        invoiceID?: string;
        allowPartialPayment?: boolean;
        noDirectRipple?: boolean;
        limitQuality?: boolean;
    };
    outcome: RippleOutcome;
    id: string;
    address: string;
    sequence: number;
}
