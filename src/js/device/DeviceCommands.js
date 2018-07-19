/* @flow */
'use strict';

import * as DEVICE from '../constants/device';
import * as ERROR from '../constants/errors';
import randombytes from 'randombytes';

import * as bitcoin from 'bitcoinjs-lib-zcash';
import * as hdnodeUtils from '../utils/hdnode';
import { isSegwitPath } from '../utils/pathUtils';
import Device from './Device';
import DataManager from '../data/DataManager';

import { getCoinInfoByCurrency, getSegwitNetwork } from '../data/CoinInfo';


import type { CoinInfo } from 'flowtype';
import type { Transport } from 'trezor-link';
import * as trezor from '../types/trezor'; // flowtype

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

    async getPublicKey(
        address_n: Array<number>,
        coin?: string
    ): Promise<trezor.PublicKey> {
        const response: MessageResponse<trezor.PublicKey> = await this.typedCall('GetPublicKey', 'PublicKey', {
            address_n: address_n,
            coin_name: coin || 'Bitcoin',
        });
        return response.message;
    }

    // Validation of xpub
    async getHDNode(
        path: Array<number>,
        coinInfo: ?CoinInfo
    ): Promise<trezor.HDNodeResponse> {
        const suffix: number = 0;
        const childPath: Array<number> = path.concat([suffix]);

        // To keep it backward compatible** this keys are exported in BTC format
        // and converted to proper format in hdnodeUtils
        // **  old firmware didn't return keys with proper prefix (xpub, Ltub.. and so on)
        const resKey: trezor.PublicKey = await this.getPublicKey(path);
        const childKey: trezor.PublicKey = await this.getPublicKey(childPath);
        const publicKey: trezor.PublicKey = hdnodeUtils.xpubDerive(resKey, childKey, suffix);

        const response: trezor.HDNodeResponse = {
            path,
            childNum: publicKey.node.child_num,
            xpub: coinInfo ? hdnodeUtils.convertXpub(publicKey.xpub, coinInfo.network) : publicKey.xpub,
            chainCode: publicKey.node.chain_code,
            publicKey: publicKey.node.public_key,
            fingerprint: publicKey.node.fingerprint,
            depth: publicKey.node.depth,
        }

        // if requested path is a segwit
        // convert xpub to new format
        if (coinInfo) {
            const segwitNetwork = getSegwitNetwork(coinInfo);
            if (segwitNetwork && isSegwitPath(path)) {
                response.xpubSegwit = hdnodeUtils.convertXpub(publicKey.xpub, segwitNetwork)
            }
        }
        return response;
    }

    async getDeviceState(): Promise<string> {
        const response: trezor.PublicKey = await this.getPublicKey([1, 0, 0]);
        const secret: string = `${response.xpub}#${this.device.features.device_id}`;
        const state: string = this.device.getTemporaryState() || bitcoin.crypto.hash256(new Buffer(secret, 'binary')).toString('hex');
        return state;
    }

    async getAddress(address_n: Array<number>, coinInfo: CoinInfo, showOnTrezor: boolean): Promise<trezor.Address> {
        const response: Object = await this.typedCall('GetAddress', 'Address', {
            address_n,
            coin_name: coinInfo.name,
            show_display: !!showOnTrezor,
            script_type: isSegwitPath(address_n) ? 'SPENDP2SHWITNESS' : 'SPENDADDRESS',
        });

        return {
            path: address_n,
            address: response.message.address
        };
    }

    async signMessage(
        address_n: Array<number>,
        message: string,
        coin: ?string
    ): Promise<trezor.MessageSignature> {
        const response: MessageResponse<trezor.MessageSignature> = await this.typedCall('SignMessage', 'MessageSignature', {
            address_n,
            message,
            coin_name: coin || 'Bitcoin',
            script_type: isSegwitPath(address_n) ? 'SPENDP2SHWITNESS' : undefined,
        });
        return response.message;
    }

    async verifyMessage(
        address: string,
        signature: string,
        message: string,
        coin: string
    ): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('VerifyMessage', 'Success', {
            address,
            signature,
            message,
            coin_name: coin
        });
        return response.message;
    }

    async ethereumGetAddress(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.EthereumAddress> {
        const response: MessageResponse<trezor.EthereumAddress> = await this.typedCall('EthereumGetAddress', 'EthereumAddress', {
            address_n: address_n,
            show_display: !!showOnTrezor,
        });
        return {
            path: address_n,
            address: response.message.address
        };
    }

    async ethereumSignMessage(address_n: Array<number>, message: string): Promise<trezor.MessageSignature> {
        const response: MessageResponse<trezor.MessageSignature> = await this.typedCall('EthereumSignMessage', 'EthereumMessageSignature', {
            address_n,
            message,
        });
        return response.message;
    }

    async ethereumVerifyMessage(address: string, signature: string, message: string): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('EthereumVerifyMessage', 'Success', {
            address,
            signature,
            message,
        });
        return response.message;
    }

    async nemGetAddress(address_n: Array<number>, network: number, showOnTrezor: boolean): Promise<trezor.NEMAddress> {
        const response: Object = await this.typedCall('NEMGetAddress', 'NEMAddress', {
            address_n,
            network,
            show_display: !!showOnTrezor,
        });
        return {
            path: address_n,
            address: response.message.address
        };
    }

    async nemSignTx(transaction: any): Promise<MessageResponse<trezor.NEMSignedTx>> {
        return this.typedCall('NEMSignTx', 'NEMSignedTx', transaction);
    }

    // deprecated
    async stellarGetPublicKey(address_n: Array<number>): Promise<MessageResponse<trezor.StellarPublicKeyMessage>> {
        const response: Object = await this.typedCall('StellarGetPublicKey', 'StellarPublicKey', { address_n });
        return {
            type: response.type,
            message: {
                path: address_n,
                public_key: response.message.public_key
            }
        };
    }

    async stellarGetAddress(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.StellarAddress> {
        const address: MessageResponse<trezor.StellarAddressMessage> = await this.typedCall('StellarGetAddress', 'StellarAddress', {
            address_n,
            show_display: !!showOnTrezor
        });

        const publicKey: MessageResponse<trezor.StellarPublicKeyMessage> = await this.typedCall('StellarGetPublicKey', 'StellarPublicKey', {
            address_n
        });

        return {
            path: address_n,
            address: address.message.address,
            publicKey: publicKey.message.public_key
        };
    }

    async stellarSignTx(transaction: any): Promise<MessageResponse<trezor.StellarSignedTx>> {
        return this.typedCall('StellarSignTx', 'StellarSignedTx', transaction);
    }

    async cipherKeyValue(
        address_n: Array<number>,
        key: string,
        value: string | Buffer,
        encrypt: boolean,
        ask_on_encrypt: boolean,
        ask_on_decrypt: boolean,
        iv: ?(string | Buffer) // in hexadecimal
    ): Promise<trezor.CipheredKeyValue> {
        const valueString: string = value instanceof Buffer ? value.toString('hex') : value;
        const ivString: ?string = iv instanceof Buffer ? iv.toString('hex') : iv;

        const response: MessageResponse<trezor.CipheredKeyValue> = await this.typedCall('CipherKeyValue', 'CipheredKeyValue', {
            address_n: address_n,
            key: key,
            value: valueString,
            encrypt: encrypt,
            ask_on_encrypt: ask_on_encrypt,
            ask_on_decrypt: ask_on_decrypt,
            iv: ivString,
        });
        return response.message;
    }

    async signIdentity(
        identity: trezor.Identity,
        challenge_hidden: string,
        challenge_visual: string
    ): Promise<MessageResponse<trezor.SignedIdentity>> {
        return this.typedCall('SignIdentity', 'SignedIdentity', {
            identity,
            challenge_hidden,
            challenge_visual,
        });
    }

    // async clearSession(): Promise<MessageResponse<trezor.Success>> {
    async clearSession(settings: Object): Promise<MessageResponse<trezor.Success>> {
        return await this.typedCall('ClearSession', 'Success', settings);
    }

    async initialize(useEmptyPassphrase: boolean = false): Promise<DefaultMessageResponse> {
        if (this.disposed) {
            throw new Error('DeviceCommands already disposed');
        }

        const payload = {};
        if (!this.device.isT1()) {
            // T2 features
            payload.state = this.device.getExpectedState() || this.device.getState();
            if (useEmptyPassphrase)
                payload.skip_passphrase = useEmptyPassphrase;
        }

        const response = await this.call('Initialize', payload);
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

        if (res.type === 'PassphraseRequest') {

            const state: ?string = !this.device.isT1() ? (this.device.getExpectedState() || this.device.getState()) : null;

            if (res.message.on_device) {
                this.device.emit(DEVICE.PASSPHRASE_ON_DEVICE, this.device);
                return this._commonCall('PassphraseAck', { state });
            }

            const cachedPassphrase: ?string = this.device.getPassphrase();
            if (typeof cachedPassphrase === 'string') {
                return this._commonCall('PassphraseAck', { passphrase: cachedPassphrase, state });
            }

            return this._promptPassphrase().then(
                passphrase => {
                    return this._commonCall('PassphraseAck', { passphrase: passphrase, state });
                },
                err => {
                    return this._commonCall('Cancel', {}).catch(e => {
                        throw err || e;
                    });
                }
            );
        }

        if (res.type === 'PassphraseStateRequest') {
            const state: string = res.message.state;
            this.device.setTemporaryState(state);
            return this._commonCall('PassphraseStateAck', { });
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
