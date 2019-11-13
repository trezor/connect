/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type {
    BinanceTransferMsg,
    BinanceOrderMsg,
    BinanceCancelMsg,
    BinanceSignedTx,
} from './trezor';

// get address

export type BinanceAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $BinanceGetAddress = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type BinanceGetAddress$ = {
    success: true,
    payload: BinanceAddress,
} | Unsuccessful$;

export type BinanceGetAddress$$ = {
    success: true,
    payload: Array<BinanceAddress>,
} | Unsuccessful$;

// get public key

export type BinancePublicKey = {
    publicKey: string,
    path: Array<number>,
    serializedPath: string,
}

export type $BinanceGetPublicKey = {
    path: $Path,
    showOnTrezor?: boolean,
}

export type BinanceGetPublicKey$ = {
    success: true,
    payload: BinancePublicKey,
} | Unsuccessful$;

export type BinanceGetPublicKey$$ = {
    success: true,
    payload: Array<BinancePublicKey>,
} | Unsuccessful$;

// sign transaction
// fields taken from https://github.com/binance-chain/javascript-sdk/blob/master/src/tx/index.js

export type BinanceTransaction = {
    chain_id: string,
    account_number?: number, // default 0
    memo?: string,
    sequence?: number, // default 0
    source?: number, // default 0

    transfer?: BinanceTransferMsg,
    placeOrder?: BinanceOrderMsg,
    cancelOrder?: BinanceCancelMsg,
}

export type PreparedMessage = BinanceTransferMsg & {
    type: 'BinanceTransferMsg',
} | BinanceOrderMsg & {
    type: 'BinanceOrderMsg',
} | BinanceCancelMsg & {
    type: 'BinanceCancelMsg',
}

export type PreparedBinanceTransaction = BinanceTransaction & {
    messages: PreparedMessage[],
}

export type $BinanceSignTransaction = $Common & {
    transaction: BinanceTransaction,
}

export type BinanceSignTransaction$ = {
    success: true,
    payload: BinanceSignedTx,
} | Unsuccessful$;
