// @flow
'use strict';

import EventEmitter from 'events';

import type {
    P_CipherKeyValue,
    P_ComposeTransaction,
    P_CustomMessage,
    P_EthereumGetAddress,
    P_EthereumSignMessage,
    P_EthereumSignTransaction,
    P_EthereumVerifyMessage,
    P_GetAccountInfo,
    P_GetAddress,
    P_GetDeviceState,
    P_GetFeatures,
    P_GetPublicKey,
    P_RequestLogin,
    P_NEMGetAddress,
    P_NEMSignTransaction,
    P_SignMessage,
    P_SignTransaction,
    P_StellarGetAddress,
    P_StellarSignTransaction,
    P_VerifyMessage
} from 'trezor-connect/params';

import type {
    R_CipherKeyValue,
    R_ComposeTransaction,
    R_CustomMessage,
    R_EthereumGetAddress,
    R_EthereumSignMessage,
    R_EthereumSignTransaction,
    R_EthereumVerifyMessage,
    R_GetAccountInfo,
    R_GetAddress,
    R_GetDeviceState,
    R_GetFeatures,
    R_GetPublicKey,
    R_RequestLogin,
    R_NEMGetAddress,
    R_NEMSignTransaction,
    R_SignMessage,
    R_SignTransaction,
    R_StellarGetAddress,
    R_StellarSignTransaction,
    R_VerifyMessage
} from 'trezor-connect/response';

export const eventEmitter: EventEmitter = new EventEmitter();

export default class Trezor {
    static on(type: string, fn: Function): void {
        eventEmitter.on(type, fn);
    }

    static off(type: string, fn: Function): void {
        eventEmitter.removeListener(type, fn);
    }

    static async cipherKeyValue(params: P_CipherKeyValue): Promise<R_CipherKeyValue> {
        return await this.__call({ method: 'cipherKeyValue', ...params });
    }

    static async composeTransaction(params: P_ComposeTransaction): Promise<R_ComposeTransaction> {
        return await this.__call({ method: 'composeTransaction', ...params });
    }

    static async ethereumGetAddress(params: P_EthereumGetAddress): Promise<R_EthereumGetAddress> {
        return await this.__call({ method: 'ethereumGetAddress', ...params });
    }

    static async ethereumSignMessage(params: P_EthereumSignMessage): Promise<Object> {
        return await this.__call({ method: 'ethereumSignMessage', ...params });
    }

    static async ethereumSignTransaction(params: P_EthereumSignTransaction): Promise<R_EthereumSignTransaction> {
        return await this.__call({ method: 'ethereumSignTransaction', ...params });
    }

    static async ethereumVerifyMessage(params: P_EthereumVerifyMessage): Promise<Object> {
        return await this.__call({ method: 'ethereumVerifyMessage', ...params });
    }

    static async getAccountInfo(params: P_GetAccountInfo): Promise<R_GetAccountInfo> {
        return await this.__call({ method: 'getAccountInfo', ...params });
    }

    static async getAddress(params: P_GetAddress): Promise<R_GetAddress> {
        return await this.__call({ method: 'getAddress', ...params });
    }

    static async getDeviceState(params: P_GetDeviceState): Promise<R_GetDeviceState> {
        return await this.__call({ method: 'getDeviceState', ...params });
    }

    static async getFeatures(params: P_GetFeatures): Promise<R_GetFeatures> {
        return await this.__call({ method: 'getFeatures', ...params });
    }

    static async getPublicKey(params: P_GetPublicKey): Promise<R_GetPublicKey> {
        return await this.__call({ method: 'getPublicKey', ...params });
    }

    static async nemGetAddress(params: P_NEMGetAddress): Promise<R_NEMGetAddress> {
        return await this.__call({ method: 'nemGetAddress', ...params });
    }

    static async nemSignTransaction(params: P_NEMSignTransaction): Promise<R_NEMSignTransaction> {
        return await this.__call({ method: 'nemSignTransaction', ...params });
    }

    static async signMessage(params: P_SignMessage): Promise<R_SignMessage> {
        return await this.__call({ method: 'signMessage', ...params });
    }

    static async signTransaction(params: P_SignTransaction): Promise<R_SignTransaction> {
        return await this.__call({ method: 'signTransaction', ...params });
    }

    static async stellarGetAddress(params: P_StellarGetAddress): Promise<R_StellarGetAddress> {
        return await this.__call({ method: 'stellarGetAddress', ...params });
    }

    static async stellarGetPublicKey(params: Object): Promise<Object> {
        return await this.__call({ method: 'stellarGetPublicKey', ...params });
    }

    static async stellarSignTransaction(params: P_StellarSignTransaction): Promise<R_StellarSignTransaction> {
        return await this.__call({ method: 'stellarSignTransaction', ...params });
    }

    static async verifyMessage(params: P_VerifyMessage): Promise<R_VerifyMessage> {
        return await this.__call({ method: 'verifyMessage', ...params });
    }

    static async __call(params: Object): Promise<Object> {
        // to override
        return {};
    }

    static dispose(): void {
        // TODO!
    }
}
