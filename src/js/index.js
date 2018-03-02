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

    static changeSettings(settings: Object) {
        // to override
    }

    static async getFeatures(params: Object): Promise<Object> {
        return await this.__call({ method: 'getFeatures', ...params });
    }

    static async cipherKeyValue(params: Object): Promise<Object> {
        return await this.__call({ method: 'cipherKeyValue', ...params });
    }

    static async requestLogin(params: Object): Promise<Object> {
        return await this.__call({ method: 'requestLogin', ...params });
    }

    static async getPublicKey(params: Object): Promise<Object> {
        return await this.__call({ method: 'getxpub', ...params });
    }

    static async composeTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'composetx', ...params });
    }

    static async signTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'signtx', ...params });
    }

    static async ethereumSignTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'ethereumSignTx', ...params });
    }

    static async ethereumGetAddress(params: Object): Promise<Object> {
        return await this.__call({ method: 'ethereumGetAddress', ...params });
    }

    static async accountComposeTransaction(params: Object): Promise<Object> {
        return await this.__call({ method: 'account-composetx', ...params });
    }

    // TODO
    static async customCall(params: Object): Promise<Object> {
        return await this.__call({ method: 'custom', ...params });
    }

    static async __call(params: Object): Promise<Object> {
        // to override
        return {};
    }

    static uiMessage(message): void {
        // to override
    }

    static dispose(): void {
        // TODO!
    }

    static getVersion(): Object {
        // to override
        return {};
    }
}
