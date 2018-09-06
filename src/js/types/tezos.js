/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

// get address

export type TezosAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $TezosGetAddress = {
    path: $Path,
    curve: 0 | 1 | 2,
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

export type TezosPublicKey = {
    publicKey: string,
    path: Array<number>,
    serializedPath: string,
}

export type $TezosGetPublicKey = {
    path: $Path,
    curve: 0 | 1 | 2,
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

export type TezosCurve =
    0 | 1 | 2;

export type TezosContractID = {
    tag: Array<number>,
    hash: string,
}

export type Reveal = {
    source: TezosContractID,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
    public_key: Array<number>,
}

export type Transaction = {
    source: TezosContractID,
    destination: TezosContractID,
    amount: number,
    parameters?: Array<number>,
    counter: number,
    fee: number,
    gas_limit: number,
    storage_limit: number,
}

export type Origination = {
    source: TezosContractID,
    manager_pubkey: Array<number>,
    balance: number,
    spendable: boolean,
    delegatable: boolean,
    delegate: Array<number>,
    script?: Array<number>,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
}

export type Delegation = {
    source: TezosContractID,
    delegate: TezosContractID,
    fee: number,
    counter: number,
    gas_limit: number,
    storage_limit: number,
}

export type TezosOperation = {
    reveal: Reveal,
    transaction: Transaction,
    origination: Origination,
    delegation: Delegation,
}

export type $TezosSignTransaction = {
    address_n: Array<number>,
    curve: TezosCurve,
    branch: Array<number>,
    reveal?: Reveal,
    transaction?: Transaction,
    origination?: Origination,
    delegation?: Delegation,
}

export type TezosSignedTx = {
    signatureContents: string,
    signature: string,
    hash: string,
}

export type TezosSignTransaction$ = {
    success: true,
    payload: TezosSignedTx,
} | Unsuccessful$;
