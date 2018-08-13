/* @flow */

// Cardano method parameters types

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type {
    Success,
    CardanoGetAddressResponse,
} from './trezor';

// GetAddress

export type $CardanoGetAddress = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type CardanoGetAddress$ = $Common & {
    success: true,
    payload: CardanoGetAddressResponse,
} | Unsuccessful$;

export type CardanoGetAddress$$ = $Common & {
    success: true,
    payload: Array<CardanoGetAddressResponse>,
} | Unsuccessful$;

// Sign transaction

type CardanoInput = {
    address_n: $Path,
    tx_hash: string,
    output_index: number,
    type?: number,
}
type CardanoOutput = {
    address_n: $Path,
    amount: string,
} | {
    address: string,
    amount: string,
}

export type $CardanoSignTransaction = $Common & {
    inputs: Array<CardanoInput>,
    outputs: Array<CardanoOutput>,
    transactions: Array<string>,
}

export type CardanoSignedTx = {
    hash: string,
    body: string,
}

export type CardanoSignTransaction$ = {
    success: true,
    payload: CardanoSignedTx,
} | Unsuccessful$;

// Sign message

export type $CardanoSignMessage = $Common & {
    path: $Path,
    message: string,
}

// retyped trezor.CardanoMessageSignature from snake_case to camelCase
export type CardanoMessageSignature = {
    publicKey: string,
    signature: string,
}

export type CardanoSignMessage$ = {
    success: true,
    payload: CardanoMessageSignature,
} | Unsuccessful$;

// Verify message

export type $CardanoVerifyMessage = $Common & {
    publicKey: string,
    signature: string,
    message: string,
}

export type CardanoVerifyMessage$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;
