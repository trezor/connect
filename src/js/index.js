// @flow
'use strict';

import EventEmitter from 'events';

export const eventEmitter: EventEmitter = new EventEmitter();

export default class Trezor {
    static on(type: string, fn: Function): void {
        eventEmitter.on(type, fn);
    }

    static off(type: string, fn: Function): void {
        eventEmitter.removeListener(type, fn);
    }

    static async init(settings: Object): Promise<void> {
        // to override
    }

    static changeSettings(settings: Object): void {
        // to override
    }

    static async cipherKeyValue(params: Object): Promise<Object> {
        return await this.__call({ method: 'cipherKeyValue', ...params });
    }

    static async signMessage(params: Object): Promise<Object> {
        return await this.__call({ method: 'signMessage', ...params });
    }

    static async verifyMessage(params: Object): Promise<Object> {
        return await this.__call({ method: 'verifyMessage', ...params });
    }

    static async ethereumGetAddress(params: Object): Promise<Object> {
        return await this.__call({ method: 'ethereumGetAddress', ...params });
    }

    static async ethereumSignTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'ethereumSignTx', ...params });
    }

    static async ethereumSignMessage(params: Object): Promise<Object> {
        return await this.__call({ method: 'ethereumSignMessage', ...params });
    }

    static async ethereumVerifyMessage(params: Object): Promise<Object> {
        return await this.__call({ method: 'ethereumVerifyMessage', ...params });
    }

    static async getDeviceState(params: Object): Promise<Object> {
        return await this.__call({ method: 'getDeviceState', ...params });
    }

    static async getFeatures(params: Object): Promise<Object> {
        return await this.__call({ method: 'getFeatures', ...params });
    }

    static async getPublicKey(params: Object): Promise<Object> {
        return await this.__call({ method: 'getPublicKey', ...params });
    }

    static async nemGetAddress(params: Object): Promise<Object> {
        return await this.__call({ method: 'nemGetAddress', ...params });
    }

    static async nemSignTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'nemSignTransaction', ...params });
    }

    static async stellarGetAddress(params: Object): Promise<Object> {
        return await this.__call({ method: 'stellarGetAddress', ...params });
    }

    static async stellarGetPublicKey(params: Object): Promise<Object> {
        return await this.__call({ method: 'stellarGetPublicKey', ...params });
    }

    static async stellarSignTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'stellarSignTx', ...params });
    }

    /*

    static async requestLogin(params: Object): Promise<Object> {
        return await this.__call({ method: 'requestLogin', ...params });
    }

    static async composeTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'composetx', ...params });
    }

    static async signTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'signtx', ...params });
    }

    static async accountComposeTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'account-composetx', ...params });
    }
    */

    static async __call(params: Object): Promise<Object> {
        // to override
        return {};
    }

    static dispose(): void {
        // TODO!
    }

    static getVersion(): Object {
        // to override
        return {};
    }
}
