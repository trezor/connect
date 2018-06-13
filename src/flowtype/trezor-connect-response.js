/* @flow */

declare module 'trezor-connect/response' {

    import type {
        EthereumSignedTx // TODO: rename to EthereumSignedTx?
    } from 'flowtype/trezor';

    declare type Unsuccessful = {
        success: false;
        payload: {
            error: string;
        }
    }

    declare type R_EthereumGetAddress = {
        success: true;
        payload: {
            address: string,
            path: Array <number>
        }
    } | Unsuccessful;

    declare type R_EthereumSignTransaction = {
        success: true;
        payload: EthereumSignedTx;
    } | Unsuccessful;

    declare type R_GetDeviceState = {
        success: true;
        payload: {
            state: string;
        }
    } | Unsuccessful;

    declare type R_GetFeatures = {
        success: true;
        payload: {
            // TODO
        }
    } | Unsuccessful;

    declare type R_GetPublicKey = {
        success: true;
        payload: {
            chainCode: string,
            childNum: number,
            depth: number,
            fingerprint: number,
            path: Array <number>,
            publicKey: string,
            xpub: string,
            xpubFormatted: string
        }
    } | Unsuccessful;
}
