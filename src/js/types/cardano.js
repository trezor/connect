/* @flow */

// Cardano method parameters types

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type { HDPubNode } from './trezor';

// GetAddress

export type $CardanoGetPublicKey = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type CardanoPublicKey = {
    path: Array<number>,
    serializedPath: string,
    publicKey: string,
    node: HDPubNode,
}

export type CardanoGetPublicKey$ = $Common & {
    success: true,
    payload: CardanoPublicKey,
} | Unsuccessful$;

export type CardanoGetPublicKey$$ = $Common & {
    success: true,
    payload: Array<CardanoPublicKey>,
} | Unsuccessful$;

// GetAddress

export type $CardanoGetAddress = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type CardanoAddress = {
    path: Array<number>,
    serializedPath: string,
    address: string,
}

export type CardanoGetAddress$ = $Common & {
    success: true,
    payload: CardanoAddress,
} | Unsuccessful$;

export type CardanoGetAddress$$ = $Common & {
    success: true,
    payload: Array<CardanoAddress>,
} | Unsuccessful$;

// Sign transaction

export type CardanoInput = {
    path: $Path,
    prev_hash: string,
    prev_index: number,
    type: number,
}
export type CardanoOutput = {
    path: $Path,
    amount: string,
} | {
    address: string,
    amount: string,
}

export type $CardanoSignTransaction = $Common & {
    inputs: Array<CardanoInput>,
    outputs: Array<CardanoOutput>,
    transactions: Array<string>,
    protocol_magic: number,
}

export type CardanoSignedTx = {
    hash: string,
    body: string,
}

export type CardanoSignTransaction$ = {
    success: true,
    payload: CardanoSignedTx,
} | Unsuccessful$;
