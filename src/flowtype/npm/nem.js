/* @flow */
// NEM types from nem-sdk
// https://nemproject.github.io/#transferTransaction

declare module 'flowtype/NEM' {

    declare export type Transaction = {
        timeStamp: number;
        amount: number;
        signature: string;
        fee: number;
        recipient: string;
        type: number;
        deadline: number;
        message: Message,
        version: number;
        signer: string;
        mosaics: Array<Mosaic>;

        // not present in sdk
        otherTrans: Transaction;
        importanceTransfer: {
            mode: number;
            publicKey: string;
        },

        modifications: Array<Modification>,
        minCosignatories: {
            relativeChange: number;
            // TODO
        },

        newPart?: string;
        rentalFeeSink?: string;
        rentalFee?: number;
        parent?: string;

        mosaicDefinition: MosaicDefinition;
        creationFeeSink: string;
        creationFee: number;

        mosaicId: MosaicID,
        supplyType: number;
        delta: number;
    }

    declare type MosaicDefinition = {
        levy: {
            type: number;
            fee: number;
            recipient: string;
            mosaicId: MosaicID;
        },
        id: MosaicID,
        description: string,
        properties: Array<{
            name: string;
            value: string;
        }>,
    }

    declare type Modification = {
        modificationType: number;
        cosignatoryAccount: string;
    }

    declare type Message = {
        payload: string;
        type: number;
        publicKey?: string; // not present in sdk
    }

    declare export type Mosaic = {
        mosaicId: MosaicID,
        quantity: number;
    }

    declare type MosaicID = {
        namespaceId: string;
        name: string;
    }
}
