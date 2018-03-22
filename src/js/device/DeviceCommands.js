/* @flow */
'use strict';

import * as DEVICE from '../constants/device';
import * as ERROR from '../constants/errors';
import randombytes from 'randombytes';

import * as trezor from './trezorTypes';
import { getHDPath } from '../utils/pathUtils';
import Device from './Device';
import DataManager from '../data/DataManager';

import type { CoinInfo } from '../backend/CoinInfo';

import * as bitcoin from 'bitcoinjs-lib-zcash';
import * as hdnodeUtils from '../utils/hdnode';

import * as signtxHelper from './helpers/signtx';
import * as ethereumSignTxHelper from './helpers/ethereumSignTx';
import type { BuildTxResult } from 'hd-wallet';
import type { Transport } from 'trezor-link';

export type MessageResponse<T> = {
    type: string,
    message: T, // in general, can be anything
};

export type DefaultMessageResponse = MessageResponse<Object>;

function assertType(res: DefaultMessageResponse, resType: string) {
    if (res.type !== resType) {
        throw new TypeError(`Response of unexpected type: ${res.type}. Should be ${resType}`);
    }
}

function generateEntropy(len: number): Buffer {
    if (global.crypto || global.msCrypto) {
        return randombytes(len);
    } else {
        throw new Error('Browser does not support crypto random');
    }
}

function filterForLog(type: string, msg: Object): Object {
    const blacklist = {
        // PassphraseAck: {
        //     passphrase: '(redacted...)',
        // },
        // CipheredKeyValue: {
        //     value: '(redacted...)',
        // },
        // GetPublicKey: {
        //     address_n: '(redacted...)',
        // },
        // PublicKey: {
        //     node: '(redacted...)',
        //     xpub: '(redacted...)',
        // },
        // DecryptedMessage: {
        //     message: '(redacted...)',
        //     address: '(redacted...)',
        // },
    };

    if (type in blacklist) {
        return { ...msg, ...blacklist[type] };
    } else {
        return msg;
    }
}

export default class DeviceCommands {
    device: Device;
    transport: Transport;
    sessionId: string;
    debug: boolean;
    disposed: boolean;

    constructor(
        device: Device,
        transport: Transport,
        sessionId: string
    ) {
        this.device = device;
        this.transport = transport;
        this.sessionId = sessionId;
        this.debug = false;
        this.disposed = false;
    }

    dispose(): void {
        this.disposed = true;
    }

    isDisposed(): boolean {
        return this.disposed;
    }

    async signMessage(
        address: Array<number> | string,
        message: string,
        coin: trezor.CoinType | string
    ): Promise<DefaultMessageResponse> {
        if (typeof address === 'string') {
            address = getHDPath(address);
        }

        // coinName(coin)
        return await this.typedCall('SignMessage', 'MessageSignature', {
            address_n: address,
            message: message,
            coin_name: 'Bitcoin',
        });
    }

    async getPublicKey(
        address_n: Array<number>,
        coin?: string
    ): Promise<MessageResponse<trezor.PublicKey>> {
        const response: MessageResponse<trezor.PublicKey> = await this.typedCall('GetPublicKey', 'PublicKey', {
            address_n: address_n,
            coin_name: coin,
        });
        return response;
    }

    // Validation of xpub
    async getHDNode(
        path: Array<number>,
        coinInfo: CoinInfo
    ): Promise<trezor.HDNodeResponse> {
        const suffix: number = 0;
        const childPath: Array<number> = path.concat([suffix]);

        // To keep it backward compatible** this keys are exported in BTC format
        // and converted to proper format in hdnodeUtils
        // **  old firmware didn't return keys with proper prefix (xpub, Ltub.. and so on)
        const resKey: MessageResponse<trezor.PublicKey> = await this.getPublicKey(path, 'Bitcoin');
        const childKey: MessageResponse<trezor.PublicKey> = await this.getPublicKey(childPath, 'Bitcoin');

        const resNode: bitcoin.HDNode = hdnodeUtils.pubKey2bjsNode(resKey.message, coinInfo.network);
        const childNode: bitcoin.HDNode = hdnodeUtils.pubKey2bjsNode(childKey.message, coinInfo.network);

        hdnodeUtils.checkDerivation(resNode, childNode, suffix);

        const publicKey: trezor.PublicKey = resKey.message;

        return {
            path,
            childNum: publicKey.node.child_num,
            xpub: publicKey.xpub,
            xpubFormatted: hdnodeUtils.convertXpub(publicKey.xpub, coinInfo.network),
            chainCode: publicKey.node.chain_code,
            publicKey: publicKey.node.public_key,
            fingerprint: publicKey.node.fingerprint,
            depth: publicKey.node.depth,
        }
    }

    async signTx(
        tx: BuildTxResult,
        refTxs: Array<bitcoin.Transaction>,
        coinInfo: CoinInfo,
        locktime: ?number,
    ): Promise<MessageResponse<trezor.SignedTx>> {
        return await signtxHelper.signTx(this.typedCall.bind(this), tx, refTxs, coinInfo, locktime);
    }

    async ethereumSignTx(
        address_n: Array<number>,
        nonce: string,
        gas_price: string,
        gas_limit: string,
        to: string,
        value: string,
        data?: string,
        chain_id?: number
    // ): Promise<MessageResponse<ethereumSignTxHelper.EthereumSignature>> {
    ): Promise<ethereumSignTxHelper.EthereumSignature> {
        return await ethereumSignTxHelper.ethereumSignTx(
            this.typedCall.bind(this),
            address_n,
            nonce,
            gas_price,
            gas_limit,
            to,
            value,
            data,
            chain_id
        );
    }

    async ethereumGetAddress(address_n: Array<number>, showOnTrezor: boolean): Promise<MessageResponse<trezor.EthereumAddress>> {
        const response: Object = await this.typedCall('EthereumGetAddress', 'EthereumAddress', {
            address_n: address_n,
            show_display: !!showOnTrezor,
        });
        return {
            type: response.type,
            message: {
                path: address_n || [],
                address: response.message.address
            }
        };
    }

    async ethereumSignMessage(address_n: Array<number>, message: string): Promise<MessageResponse<trezor.MessageSignature>> {
        return await this.typedCall('EthereumSignMessage', 'EthereumMessageSignature', {
            address_n,
            message,
        });
    }

    async ethereumVerifyMessage(address: string, signature: string, message: string): Promise<MessageResponse<trezor.Success>> {
        return await this.typedCall('EthereumVerifyMessage', 'Success', {
            address,
            signature,
            message,
        });
    }

    async cipherKeyValue(
        address_n: Array<number>,
        key: string,
        value: string | Buffer,
        encrypt: boolean,
        ask_on_encrypt: boolean,
        ask_on_decrypt: boolean,
        iv: ?(string | Buffer) // in hexadecimal
    ): Promise<MessageResponse<{value: string}>> {
        const valueString: string = value instanceof Buffer ? value.toString('hex') : value;
        const ivString: ?string = iv instanceof Buffer ? iv.toString('hex') : iv;

        return await this.typedCall('CipherKeyValue', 'CipheredKeyValue', {
            address_n: address_n,
            key: key,
            value: valueString,
            encrypt: encrypt,
            ask_on_encrypt: ask_on_encrypt,
            ask_on_decrypt: ask_on_decrypt,
            iv: ivString,
        });
    }

    // async clearSession(): Promise<MessageResponse<trezor.Success>> {
    async clearSession(settings: Object): Promise<any> {
        return await this.typedCall('ClearSession', 'Success', settings);
    }

    async initialize() {
        if (this.disposed) {
            throw new Error('DeviceCommands already disposed');
        }

        // if (!this.device.getState()) {
        //    await this.clearSession({});
        // }

        const response = await this.call('Initialize', { state: this.device.getState() });
        assertType(response, 'Features');
        return response;
    }

    // Sends an async message to the opened device.
    async call(type: string, msg: Object = {}): Promise<DefaultMessageResponse> {
        const logMessage: Object = filterForLog(type, msg);

        if (this.debug) {
            console.log('[trezor.js] [call] Sending', type, logMessage, this.transport);
        }

        try {
            const res: DefaultMessageResponse = await this.transport.call(this.sessionId, type, msg);
            const logMessage = filterForLog(res.type, res.message);
            if (this.debug) {
                console.log('[trezor.js] [call] Received', res.type, logMessage);
            }
            return res;
        } catch (error) {
            if (this.debug) {
                console.log('[trezor.js] [call] Received error', error);
            }
            // TODO: throw trezor error
            throw error;
        }
    }

    async typedCall(type: string, resType: string, msg: Object = {}): Promise<DefaultMessageResponse> {
        if (this.disposed) {
            throw new Error('DeviceCommands already disposed');
        }

        const response: DefaultMessageResponse = await this._commonCall(type, msg);
        assertType(response, resType);
        return response;
    }

    async _commonCall(type: string, msg: Object): Promise<DefaultMessageResponse> {
        try {
            const resp = await this.call(type, msg);
            return await this._filterCommonTypes(resp);
        } catch (error) {
            throw error;
        }
    }

    async _filterCommonTypes(res: DefaultMessageResponse): Promise<DefaultMessageResponse> {
        if (res.type === 'Failure') {
            const e = new Error(res.message.message);
            // $FlowIssue extending errors in ES6 "correctly" is a PITA
            e.code = res.message.code;
            return Promise.reject(e);
        }

        if (res.type === 'ButtonRequest') {
            this.device.emit('button', this.device, res.message.code);
            return this._commonCall('ButtonAck', {});
        }

        if (res.type === 'EntropyRequest') {
            return this._commonCall('EntropyAck', {
                entropy: generateEntropy(32).toString('hex'),
            });
        }

        if (res.type === 'PinMatrixRequest') {
            return this._promptPin(res.message.type).then(
                pin => {
                    return this._commonCall('PinMatrixAck', { pin: pin });
                },
                () => {
                    return this._commonCall('Cancel', {});
                }
            );
        }

        if (res.type === 'PassphraseStateRequest') {
            const state: string = res.message.state;
            const currentState: ?string = this.device.getState();
            if (currentState && currentState !== state) {
                throw ERROR.INVALID_STATE;
            }

            this.device.setState(state);
            return this._commonCall('PassphraseStateAck', { });
        }

        if (res.type === 'PassphraseRequest') {
            if (res.message.on_device) {
                return this._commonCall('PassphraseAck', { state: this.device.getState() });
            }

            // console.warn("PassphraseRequest STATE!", this.device.getState(), res.message.on_device)
            const cachedPassphrase: ?string = this.device.getPassphrase();
            if (typeof cachedPassphrase === 'string') {
                return this._commonCall('PassphraseAck', { passphrase: cachedPassphrase, state: this.device.getState() });
            }

            return this._promptPassphrase().then(
                passphrase => {
                    if (DataManager.isPassphraseCached()) {
                        this.device.setPassphrase(passphrase);
                    } else {
                        this.device.setPassphrase(null);
                    }
                    // this.device.setPassphrase(null);
                    return this._commonCall('PassphraseAck', { passphrase: passphrase, state: this.device.getState() });
                },
                err => {
                    return this._commonCall('Cancel', {}).catch(e => {
                        throw err || e;
                    });
                }
            );
        }

        if (res.type === 'WordRequest') {
            return this._promptWord().then(
                word => {
                    return this._commonCall('WordAck', { word: word });
                },
                () => {
                    return this._commonCall('Cancel', {});
                }
            );
        }

        return Promise.resolve(res);
    }

    _promptPin(type: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.device.listenerCount(DEVICE.PIN) > 0) {
                this.device.emit(DEVICE.PIN, this.device, type, (err, pin) => {
                    if (err || pin == null) {
                        reject(err);
                    } else {
                        resolve(pin);
                    }
                });
            } else {
                // if (this.session.debug) {
                console.warn('[trezor.js] [call] PIN callback not configured, cancelling request');
                // }
                reject(new Error('PIN callback not configured'));
            }
        });
    }

    _promptPassphrase(): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.device.listenerCount(DEVICE.PASSPHRASE) > 0) {
                this.device.emit(DEVICE.PASSPHRASE, this.device, (err, passphrase) => {
                    if (err || passphrase == null) {
                        reject(err);
                    } else {
                        resolve(passphrase.normalize('NFKD'));
                    }
                });
            } else {
                // if (this.session.debug) {
                console.warn('[trezor.js] [call] Passphrase callback not configured, cancelling request');
                // }
                reject(new Error('Passphrase callback not configured'));
            }
        });
    }

    _promptWord(): Promise<string> {
        return new Promise((resolve, reject) => {
            // if (!this.session.wordEvent.emit((err, word) => {
            //     if (err || word == null) {
            //         reject(err);
            //     } else {
            //         resolve(word.toLocaleLowerCase());
            //     }
            // })) {
            //     if (this.session.debug) {
            //         console.warn('[trezor.js] [call] Word callback not configured, cancelling request');
            //     }
            reject(new Error('Word callback not configured'));
            // }
        });
    }
}
