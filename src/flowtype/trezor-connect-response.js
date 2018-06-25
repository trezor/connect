/* @flow */

declare module 'trezor-connect/response' {

    import type {
        AccountInfo,
        Address,

        EthereumSignedTx,
        Features,
        HDNodeResponse,

        MessageSignature,
        NEMAddress,
        NEMSignedTx,

        Success,
        SignedTx,
        SignedIdentity,
        StellarAddress,
        StellarSignedTx,

    } from 'flowtype/trezor';

    declare type Unsuccessful = {
        success: false;
        payload: {
            error: string;
        }
    }

    declare type R_CipherKeyValue = {
        success: true;
        payload: {
            value: string,
        }
    } | Unsuccessful;

    declare type R_CustomMessage = {
        success: true;
        payload: any;
    } | Unsuccessful;

    declare type R_ComposeTransaction = {
        success: true;
        payload: any;
    } | Unsuccessful;

    declare type R_EthereumGetAddress = {
        success: true;
        payload: {
            address: string,
            path: Array <number>
        }
    } | Unsuccessful;

    declare type R_EthereumSignMessage = {
        success: true;
        payload: MessageSignature;
    } | Unsuccessful;

    declare type R_EthereumSignTransaction = {
        success: true;
        payload: EthereumSignedTx;
    } | Unsuccessful;

    declare type R_EthereumVerifyMessage = {
        success: true;
        payload: Success;
    } | Unsuccessful;

    declare type R_GetAccountInfo = {
        success: true;
        payload: AccountInfo,
    } | Unsuccessful;

    declare type R_GetAddress = {
        success: true;
        payload: Address,
    } | Unsuccessful;

    declare type R_GetDeviceState = {
        success: true;
        payload: {
            state: string;
        }
    } | Unsuccessful;

    declare type R_GetFeatures = {
        success: true;
        payload: Features;
    } | Unsuccessful;

    declare type R_GetPublicKey = {
        success: true;
        payload: HDNodeResponse;
    } | Unsuccessful;

    declare type R_RequestLogin = {
        success: true;
        payload: SignedIdentity;
    } | Unsuccessful;

    declare type R_NEMGetAddress = {
        success: true;
        payload: NEMAddress;
    } | Unsuccessful;

    declare type R_NEMSignTransaction = {
        success: true;
        payload: NEMSignedTx;
    } | Unsuccessful;

    declare type R_SignMessage = {
        success: true;
        payload: MessageSignature;
    } | Unsuccessful;

    declare type R_SignTransaction = {
        success: true;
        payload: SignedTx;
    } | Unsuccessful;

    declare type R_StellarGetAddress = {
        success: true;
        payload: StellarAddress;
    } | Unsuccessful;

    declare type R_StellarSignTransaction = {
        success: true;
        payload: StellarSignedTx;
    } | Unsuccessful;

    declare type R_VerifyMessage = {
        success: true;
        payload: Success;
    } | Unsuccessful;
}
