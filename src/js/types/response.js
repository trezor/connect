/* @flow */

import type {
    CipheredKeyValue,
    Address,
    Features,
    HDNodeResponse,
    MessageSignature,
    Success,
    SignedTx,
} from './trezor';

export type Unsuccessful$ = {
    success: false,
    payload: {
        error: string,
    },
}

export type BlockchainDisconnect$ = {
    success: true,
    payload: {
        disconnected: true,
    },
} | Unsuccessful$;

export type BlockchainSubscribe$ = {
    success: true,
    payload: {
        subscribed: true,
    },
} | Unsuccessful$;

export type CipherKeyValue$ = {
    success: true,
    payload: CipheredKeyValue,
} | Unsuccessful$;

export type CipherKeyValue$$ = {
    success: true,
    payload: Array<CipheredKeyValue>,
} | Unsuccessful$;

export type CustomMessage$ = {
    success: true,
    payload: any,
} | Unsuccessful$;

export type ComposeTransaction$ = {
    success: true,
    payload: SignedTx,
} | Unsuccessful$;

// response for getAccountInfo method

// copy from hd-wallet
export type Utxo = {
    index: number, // index of output IN THE TRANSACTION
    transactionHash: string, // hash of the transaction
    value: number, // how much money sent
    addressPath: [number, number], // path
    height: ?number, // null == unconfirmed
    coinbase: boolean,
    tsize: number, // total size - in case of segwit, total, with segwit data
    vsize: number, // virtual size - segwit concept - same as size in non-segwit
    own: boolean,
};

export type AccountInfoPayload = {
    id: number,
    path: Array<number>,
    serializedPath: string,
    xpub: string,
    address: string,
    addressIndex: number,
    addressPath: Array<number>,
    addressSerializedPath: string,
    balance: number,
    confirmed: number,
    transactions: number,
    utxo: Array<Utxo>,
    usedAddresses: Array<{
        address: string,
        received: number,
    }>,
    unusedAddresses: Array<string>,
}

export type GetAccountInfo$ = {
    success: true,
    payload: AccountInfoPayload,
} | Unsuccessful$;

export type GetAddress$ = {
    success: true,
    payload: Address,
} | Unsuccessful$;

export type GetAddress$$ = {
    success: true,
    payload: Array<Address>,
} | Unsuccessful$;

export type GetDeviceState$ = {
    success: true,
    payload: {
        state: string,
    },
} | Unsuccessful$;

export type GetFeatures$ = {
    success: true,
    payload: Features,
} | Unsuccessful$;

export type GetPublicKey$ = {
    success: true,
    payload: HDNodeResponse,
} | Unsuccessful$;

export type GetPublicKey$$ = {
    success: true,
    payload: Array<HDNodeResponse>,
} | Unsuccessful$;

export type PushTransaction$ = {
    success: true,
    payload: {
        txid: string,
    },
} | Unsuccessful$;

export type RequestLogin$ = {
    success: true,
    payload: {
        address: string,
        publicKey: string,
        signature: string,
    },
} | Unsuccessful$;

export type ResetDevice$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type SignMessage$ = {
    success: true,
    payload: MessageSignature,
} | Unsuccessful$;

export type SignTransaction$ = {
    success: true,
    payload: SignedTx,
} | Unsuccessful$;

export type VerifyMessage$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type WipeDevice$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;
