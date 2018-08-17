/* @flow */

import type {
    CipheredKeyValue,
    AccountInfo,
    Address,

    EthereumSignedTx,
    EthereumAddress,
    Features,
    HDNodeResponse,

    MessageSignature,
    NEMAddress,
    NEMSignedTx,

    Success,
    SignedTx,
    StellarAddress,

    LiskAddress,
    LiskMessageSignature,
    LiskSignedTx,
} from './trezor';

export type Unsuccessful$ = {
    success: false,
    payload: {
        error: string,
    },
}

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

export type EthereumGetAddress$ = {
    success: true,
    payload: EthereumAddress,
} | Unsuccessful$;

export type EthereumGetAddress$$ = {
    success: true,
    payload: Array<EthereumAddress>,
} | Unsuccessful$;

export type EthereumSignMessage$ = {
    success: true,
    payload: MessageSignature,
} | Unsuccessful$;

export type EthereumSignTransaction$ = {
    success: true,
    payload: EthereumSignedTx,
} | Unsuccessful$;

export type EthereumVerifyMessage$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type GetAccountInfo$ = {
    success: true,
    payload: AccountInfo,
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
    txid: string,
} | Unsuccessful$;

export type RequestLogin$ = {
    success: true,
    payload: {
        address: string,
        publicKey: string,
        signature: string,
    },
} | Unsuccessful$;

export type NEMGetAddress$ = {
    success: true,
    payload: NEMAddress,
} | Unsuccessful$;

export type NEMGetAddress$$ = {
    success: true,
    payload: Array<NEMAddress>,
} | Unsuccessful$;

export type NEMSignTransaction$ = {
    success: true,
    payload: NEMSignedTx,
} | Unsuccessful$;

export type SignMessage$ = {
    success: true,
    payload: MessageSignature,
} | Unsuccessful$;

export type SignTransaction$ = {
    success: true,
    payload: SignedTx,
} | Unsuccessful$;

export type StellarGetAddress$ = {
    success: true,
    payload: StellarAddress | Array<StellarAddress>,
} | Unsuccessful$;

export type StellarSignTransaction$ = {
    success: true,
    payload: {
        publicKey: string,
        signature: string,
    },
} | Unsuccessful$;

export type LiskGetAddress$ = {
    success: true,
    payload: LiskAddress | Array<LiskAddress>,
} | Unsuccessful$;

export type LiskSignMessage$ = {
    success: true,
    payload: LiskMessageSignature,
} | Unsuccessful$;

export type LiskVerifyMessage$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;

export type LiskSignTransaction$ = {
    success: true,
    payload: LiskSignedTx,
} | Unsuccessful$

export type VerifyMessage$ = {
    success: true,
    payload: Success,
} | Unsuccessful$;
