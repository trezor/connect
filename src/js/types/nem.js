/* @flow */
// NEM types from nem-sdk
// https://nemproject.github.io/#transferTransaction

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type { NEMSignedTx } from './trezor';

type MosaicID = {
    namespaceId: string,
    name: string,
}

type MosaicDefinition = {
    levy: {
        type: number,
        fee: number,
        recipient: string,
        mosaicId: MosaicID,
    },
    id: MosaicID,
    description: string,
    properties: Array<{
        name: string,
        value: string,
    }>,
}

type Modification = {
    modificationType: number,
    cosignatoryAccount: string,
}

type Message = {
    payload: string,
    type: number,
    publicKey?: string, // not present in sdk
}

export type Mosaic = {
    mosaicId: MosaicID,
    quantity: number,
}

export type Transaction = {
    timeStamp: number,
    amount: number,
    signature: string,
    fee: number,
    recipient: string,
    type: number,
    deadline: number,
    message: Message,
    version: number,
    signer: string,
    mosaics: Array<Mosaic>,

    // not present in sdk
    otherTrans: Transaction,
    importanceTransfer: {
        mode: number,
        publicKey: string,
    },

    modifications: Array<Modification>,
    minCosignatories: {
        relativeChange: number,
        // TODO
    },

    newPart?: string,
    rentalFeeSink?: string,
    rentalFee?: number,
    parent?: string,

    mosaicDefinition: MosaicDefinition,
    creationFeeSink: string,
    creationFee: number,

    mosaicId: MosaicID,
    supplyType: number,
    delta: number,
}

// get address

export type NEMAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $NEMGetAddress = {
    path: $Path,
    network: number,
    showOnTrezor?: boolean,
}

export type NEMGetAddress$ = {
    success: true,
    payload: NEMAddress,
} | Unsuccessful$;

export type NEMGetAddress$$ = {
    success: true,
    payload: Array<NEMAddress>,
} | Unsuccessful$;

// sign transaction

export type $NEMSignTransaction = $Common & {
    path: $Path,
    transaction: Transaction,
}

export type NEMSignTransaction$ = {
    success: true,
    payload: NEMSignedTx,
} | Unsuccessful$;
