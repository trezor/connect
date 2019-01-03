/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

// get address

export type TezosAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $TezosGetAddress = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type TezosGetAddress$ = {
    success: true,
    payload: TezosAddress,
} | Unsuccessful$;

export type TezosGetAddress$$ = {
    success: true,
    payload: Array<TezosAddress>,
} | Unsuccessful$;

// get public key

export type TezosPublicKey = $Common & {
    publicKey: string,
    path: Array<number>,
    serializedPath: string,
}

export type $TezosGetPublicKey = {
    path: $Path,
    showOnTrezor?: boolean,
}

export type TezosGetPublicKey$ = {
    success: true,
    payload: TezosPublicKey,
} | Unsuccessful$;

export type TezosGetPublicKey$$ = {
    success: true,
    payload: Array<TezosPublicKey>,
} | Unsuccessful$;

// sign transaction

export type TezosRevealOperation = {
    source: string,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
    public_key: string,
}

export type TezosTransactionOperation = {
    source: string,
    destination: string,
    amount: number,
    parameters?: Array<number>,
    counter: number,
    fee: number,
    gas_limit: number,
    storage_limit: number,
};

export type TezosOriginationOperation = {
    source: string,
    manager_pubkey: string,
    balance: number,
    spendable: boolean,
    delegatable: boolean,
    delegate: string,
    script?: Array<number>,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
};

export type TezosDelegationOperation = {
    source: string,
    delegate: string,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
};

export type TezosOperation = {
    reveal?: TezosRevealOperation,
    transaction?: TezosTransactionOperation,
    origination?: TezosOriginationOperation,
    delegation?: TezosDelegationOperation,
};

export type $TezosSignTransaction = $Common & {
    address_n: Array<number>,
    branch: string,
    operation: TezosOperation,
};

export type TezosSignedTx = {
    signatureContents: string,
    signature: string,
    hash: string,
};

export type TezosSignTransaction$ = {
    success: true,
    payload: TezosSignedTx,
} | Unsuccessful$;
