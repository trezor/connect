/* @flow */

import { DEVICE, ERRORS, NETWORK } from '../constants';
import randombytes from 'randombytes';

import * as bitcoin from '@trezor/utxo-lib';
import * as hdnodeUtils from '../utils/hdnode';
import { isMultisigPath, isSegwitPath, isBech32Path, getSerializedPath, getScriptType, toHardened } from '../utils/pathUtils';
import { getAccountAddressN } from '../utils/accountUtils';
import { toChecksumAddress } from '../utils/ethereumUtils';
import { resolveAfter } from '../utils/promiseUtils';
import { versionCompare } from '../utils/versionUtils';
import Device from './Device';

import { getSegwitNetwork, getBech32Network } from '../data/CoinInfo';

import type { CoinInfo, BitcoinNetworkInfo, EthereumNetworkInfo } from '../types';
import type { Transport } from 'trezor-link';
import * as trezor from '../types/trezor/protobuf'; // flowtype only

export type MessageResponse<T> = {
    type: string;
    message: T; // in general, can be anything
};

export type DefaultMessageResponse = MessageResponse<Object>;

export type PassphrasePromptResponse = {
    passphrase?: string;
    passphraseOnDevice?: boolean;
    cache?: boolean;
};

function assertType(res: DefaultMessageResponse, resType: string) {
    const splitResTypes = resType.split('|');
    if (!(splitResTypes.includes(res.type))) {
        throw ERRORS.TypedError('Runtime', `assertType: Response of unexpected type: ${res.type}. Should be ${resType}`);
    }
}

function generateEntropy(len: number): Buffer {
    try {
        return randombytes(len);
    } catch (err) {
        throw ERRORS.TypedError('Runtime', 'generateEntropy: Environment does not support crypto random');
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
    callPromise: ?Promise<DefaultMessageResponse> = undefined;
    // see DeviceCommands.cancel
    _cancelableRequest: ?(error: any) => void = undefined;

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
        this._cancelableRequest = undefined;
    }

    isDisposed(): boolean {
        return this.disposed;
    }

    async getPublicKey(
        address_n: Array<number>,
        coin_name: string,
        script_type?: ?string,
        show_display?: ?boolean,
    ): Promise<trezor.PublicKey> {
        const response: MessageResponse<trezor.PublicKey> = await this.typedCall('GetPublicKey', 'PublicKey', {
            address_n,
            coin_name,
            script_type,
            show_display,
        });
        return response.message;
    }

    // Validation of xpub
    async getHDNode(
        path: Array<number>,
        coinInfo: ?BitcoinNetworkInfo,
        validation?: boolean = true,
        showOnTrezor?: boolean = false,
    ): Promise<trezor.HDNodeResponse> {
        if (!this.device.atLeast(['1.7.2', '2.0.10']) || !coinInfo) {
            return await this.getBitcoinHDNode(path, coinInfo);
        }

        let network: ?bitcoin.Network;
        if (isMultisigPath(path)) {
            network = coinInfo.network;
        } else if (isSegwitPath(path)) {
            network = getSegwitNetwork(coinInfo);
        } else if (isBech32Path(path)) {
            network = getBech32Network(coinInfo);
        }

        let scriptType: ?trezor.InputScriptType = getScriptType(path);
        if (!network) {
            network = coinInfo.network;
            if (scriptType !== 'SPENDADDRESS') {
                scriptType = undefined;
            }
        }

        let publicKey: trezor.PublicKey;
        if (showOnTrezor || !validation) {
            publicKey = await this.getPublicKey(path, coinInfo.name, scriptType, showOnTrezor);
        } else {
            const suffix: number = 0;
            const childPath: Array<number> = path.concat([suffix]);
            const resKey: trezor.PublicKey = await this.getPublicKey(path, coinInfo.name, scriptType);
            const childKey: trezor.PublicKey = await this.getPublicKey(childPath, coinInfo.name, scriptType);
            publicKey = hdnodeUtils.xpubDerive(resKey, childKey, suffix, network, coinInfo.network);
        }

        const response: trezor.HDNodeResponse = {
            path,
            serializedPath: getSerializedPath(path),
            childNum: publicKey.node.child_num,
            xpub: publicKey.xpub,
            chainCode: publicKey.node.chain_code,
            publicKey: publicKey.node.public_key,
            fingerprint: publicKey.node.fingerprint,
            depth: publicKey.node.depth,
        };

        if (network !== coinInfo.network) {
            response.xpubSegwit = response.xpub;
            response.xpub = hdnodeUtils.convertXpub(publicKey.xpub, network, coinInfo.network);
        }

        return response;
    }

    // deprecated
    // legacy method (below FW 1.7.2 & 2.0.10), remove it after next "required" FW update.
    // keys are exported in BTC format and converted to proper format in hdnodeUtils
    // old firmware didn't return keys with proper prefix (ypub, Ltub.. and so on)
    async getBitcoinHDNode(
        path: Array<number>,
        coinInfo?: ?BitcoinNetworkInfo,
        validation?: boolean = true
    ): Promise<trezor.HDNodeResponse> {
        let publicKey: trezor.PublicKey;
        if (!validation) {
            publicKey = await this.getPublicKey(path, 'Bitcoin');
        } else {
            const suffix: number = 0;
            const childPath: Array<number> = path.concat([suffix]);

            const resKey: trezor.PublicKey = await this.getPublicKey(path, 'Bitcoin');
            const childKey: trezor.PublicKey = await this.getPublicKey(childPath, 'Bitcoin');
            publicKey = hdnodeUtils.xpubDerive(resKey, childKey, suffix);
        }

        const response: trezor.HDNodeResponse = {
            path,
            serializedPath: getSerializedPath(path),
            childNum: publicKey.node.child_num,
            xpub: coinInfo ? hdnodeUtils.convertBitcoinXpub(publicKey.xpub, coinInfo.network) : publicKey.xpub,
            chainCode: publicKey.node.chain_code,
            publicKey: publicKey.node.public_key,
            fingerprint: publicKey.node.fingerprint,
            depth: publicKey.node.depth,
        };

        // if requested path is a segwit or bech32
        // convert xpub to new format
        if (coinInfo) {
            const bech32Network = getBech32Network(coinInfo);
            const segwitNetwork = getSegwitNetwork(coinInfo);
            if (bech32Network && isBech32Path(path)) {
                response.xpubSegwit = hdnodeUtils.convertBitcoinXpub(publicKey.xpub, bech32Network);
            } else if (segwitNetwork && isSegwitPath(path)) {
                response.xpubSegwit = hdnodeUtils.convertBitcoinXpub(publicKey.xpub, segwitNetwork);
            }
        }
        return response;
    }

    async getAddress(
        address_n: Array<number>,
        coinInfo: BitcoinNetworkInfo,
        showOnTrezor: boolean,
        multisig?: trezor.MultisigRedeemScriptType,
        scriptType?: trezor.InputScriptType,
    ): Promise<trezor.Address> {
        if (!scriptType) {
            scriptType = getScriptType(address_n);
            if (scriptType === 'SPENDMULTISIG' && !multisig) {
                scriptType = 'SPENDADDRESS';
            }
        }
        if (multisig && multisig.pubkeys) {
            // convert xpub strings to HDNodeTypes
            multisig.pubkeys.forEach(pk => {
                if (typeof pk.node === 'string') {
                    pk.node = hdnodeUtils.xpubToHDNodeType(pk.node, coinInfo.network);
                }
            });
        }
        const response = await this.typedCall('GetAddress', 'Address', {
            address_n,
            coin_name: coinInfo.name,
            show_display: !!showOnTrezor,
            multisig,
            script_type: scriptType || 'SPENDADDRESS',
        });

        return {
            address: response.message.address,
            path: address_n,
            serializedPath: getSerializedPath(address_n),
        };
    }

    async signMessage(
        address_n: Array<number>,
        message: string,
        coin: ?string
    ): Promise<trezor.MessageSignature> {
        const scriptType: trezor.InputScriptType = getScriptType(address_n);
        const response: MessageResponse<trezor.MessageSignature> = await this.typedCall('SignMessage', 'MessageSignature', {
            address_n,
            message,
            coin_name: coin || 'Bitcoin',
            script_type: scriptType && scriptType !== 'SPENDMULTISIG' ? scriptType : 'SPENDADDRESS', // script_type 'SPENDMULTISIG' throws Failure_FirmwareError
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
            coin_name: coin,
        });
        return response.message;
    }

    async ethereumGetAddress(address_n: Array<number>, network: ?EthereumNetworkInfo, showOnTrezor?: boolean = true): Promise<trezor.EthereumAddress> {
        const response: MessageResponse<trezor.EthereumAddress> = await this.typedCall('EthereumGetAddress', 'EthereumAddress', {
            address_n: address_n,
            show_display: !!showOnTrezor,
        });
        response.message.address = toChecksumAddress(response.message.address, network);
        return response.message;
    }

    async ethereumGetPublicKey(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.HDNodeResponse> {
        if (!this.device.atLeast(['1.8.1', '2.1.0'])) {
            return await this.getHDNode(address_n);
        }

        const suffix: number = 0;
        const childPath: Array<number> = address_n.concat([suffix]);
        const resKey: MessageResponse<trezor.PublicKey> = await this.typedCall('EthereumGetPublicKey', 'EthereumPublicKey', {
            address_n: address_n,
            show_display: showOnTrezor,
        });
        const childKey: MessageResponse<trezor.PublicKey> = await this.typedCall('EthereumGetPublicKey', 'EthereumPublicKey', {
            address_n: childPath,
            show_display: false,
        });
        const publicKey: trezor.PublicKey = hdnodeUtils.xpubDerive(resKey.message, childKey.message, suffix);

        return {
            path: address_n,
            serializedPath: getSerializedPath(address_n),
            childNum: publicKey.node.child_num,
            xpub: publicKey.xpub,
            chainCode: publicKey.node.chain_code,
            publicKey: publicKey.node.public_key,
            fingerprint: publicKey.node.fingerprint,
            depth: publicKey.node.depth,
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
        const response: MessageResponse<trezor.NEMAddress> = await this.typedCall('NEMGetAddress', 'NEMAddress', {
            address_n,
            network,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async nemSignTx(transaction: trezor.NEMSignTxMessage): Promise<trezor.NEMSignedTx> {
        const response: MessageResponse<trezor.NEMSignedTx> = await this.typedCall('NEMSignTx', 'NEMSignedTx', transaction);
        return response.message;
    }

    // Ripple: begin
    async rippleGetAddress(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.RippleAddress> {
        const response: MessageResponse<trezor.RippleAddress> = await this.typedCall('RippleGetAddress', 'RippleAddress', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async rippleSignTx(transaction: trezor.RippleTransaction): Promise<trezor.RippleSignedTx> {
        const response: MessageResponse<trezor.RippleSignedTx> = await this.typedCall('RippleSignTx', 'RippleSignedTx', transaction);
        return response.message;
    }
    // Ripple: end

    // Stellar: begin
    async stellarGetAddress(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.StellarAddress> {
        const response: MessageResponse<trezor.StellarAddress> = await this.typedCall('StellarGetAddress', 'StellarAddress', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    // StellarSignTx message can be found inside ./core/methods/helpers/stellarSignTx
    // Stellar: end

    // EOS: begin
    async eosGetPublicKey(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.EosPublicKey> {
        const response: MessageResponse<trezor.EosPublicKey> = await this.typedCall('EosGetPublicKey', 'EosPublicKey', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    // EosSignTx message can be found inside ./core/methods/helpers/eosSignTx
    // EOS: end

    // Cardano: begin
    async cardanoGetPublicKey(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.CardanoPublicKey> {
        const response: MessageResponse<trezor.CardanoPublicKey> = await this.typedCall('CardanoGetPublicKey', 'CardanoPublicKey', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async cardanoGetAddress(addressParameters: trezor.CardanoAddressParameters, protocolMagic: number, networkId: number, showOnTrezor: boolean): Promise<trezor.CardanoAddress> {
        const response: MessageResponse<trezor.CardanoAddress> = await this.typedCall('CardanoGetAddress', 'CardanoAddress', {
            address_parameters: addressParameters,
            protocol_magic: protocolMagic,
            network_id: networkId,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async cardanoSignTx(
        inputs: Array<trezor.CardanoTxInput>,
        outputs: Array<trezor.CardanoTxOutput>,
        fee: string,
        ttl: string,
        certificates: Array<trezor.CardanoTxCertificate>,
        withdrawals: Array<trezor.CardanoTxWithdrawal>,
        metadata: string,
        protocolMagic: number,
        networkId: number
    ): Promise<trezor.CardanoSignedTx> {
        const response: MessageResponse<trezor.CardanoSignedTx> = await this.typedCall('CardanoSignTx', 'CardanoSignedTx', {
            inputs,
            outputs,
            fee,
            ttl,
            certificates,
            withdrawals,
            metadata,
            protocol_magic: protocolMagic,
            network_id: networkId,
        });
        return response.message;
    }
    // Cardano: end

    // Lisk: begin
    async liskGetAddress(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.LiskAddress> {
        const response: MessageResponse<trezor.LiskAddress> = await this.typedCall('LiskGetAddress', 'LiskAddress', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async liskGetPublicKey(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.LiskPublicKey> {
        const response: MessageResponse<trezor.LiskPublicKey> = await this.typedCall('LiskGetPublicKey', 'LiskPublicKey', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async liskSignMessage(address_n: Array<number>, message: string): Promise<trezor.LiskMessageSignature> {
        const response: MessageResponse<trezor.LiskMessageSignature> = await this.typedCall('LiskSignMessage', 'LiskMessageSignature', {
            address_n,
            message,
        });
        return response.message;
    }

    async liskVerifyMessage(public_key: string, signature: string, message: string): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('LiskVerifyMessage', 'Success', {
            public_key,
            signature,
            message,
        });
        return response.message;
    }

    async liskSignTx(address_n: Array<number>, transaction: trezor.LiskTransaction): Promise<trezor.LiskSignedTx> {
        const response: MessageResponse<trezor.LiskSignedTx> = await this.typedCall('LiskSignTx', 'LiskSignedTx', {
            address_n,
            transaction,
        });
        return response.message;
    }
    // Lisk: end

    // Tezos: begin
    async tezosGetAddress(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.TezosAddress> {
        const response: MessageResponse<trezor.TezosAddress> = await this.typedCall('TezosGetAddress', 'TezosAddress', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async tezosGetPublicKey(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.TezosPublicKey> {
        const response: MessageResponse<trezor.TezosPublicKey> = await this.typedCall('TezosGetPublicKey', 'TezosPublicKey', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async tezosSignTransaction(message: trezor.TezosTransaction): Promise<trezor.TezosSignedTx> {
        const response: MessageResponse<trezor.TezosSignedTx> = await this.typedCall('TezosSignTx', 'TezosSignedTx', message);
        return response.message;
    }
    // Tezos: end

    // Binance: begin
    async binanceGetAddress(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.BinanceAddress> {
        const response: MessageResponse<trezor.BinanceAddress> = await this.typedCall('BinanceGetAddress', 'BinanceAddress', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }

    async binanceGetPublicKey(address_n: Array<number>, showOnTrezor: boolean): Promise<trezor.BinancePublicKey> {
        const response: MessageResponse<trezor.BinancePublicKey> = await this.typedCall('BinanceGetPublicKey', 'BinancePublicKey', {
            address_n,
            show_display: !!showOnTrezor,
        });
        return response.message;
    }
    // Binance: end

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
    ): Promise<trezor.SignedIdentity> {
        const response: MessageResponse<trezor.SignedIdentity> = await this.typedCall('SignIdentity', 'SignedIdentity', {
            identity,
            challenge_hidden,
            challenge_visual,
        });
        return response.message;
    }

    async clearSession(settings: Object): Promise<MessageResponse<trezor.Success>> {
        return await this.typedCall('ClearSession', 'Success', settings);
    }

    async getDeviceState(networkType: ?string) {
        const response = await this._getAddressForNetworkType(networkType);
        // bitcoin.crypto.hash256(Buffer.from(secret, 'binary')).toString('hex');
        const state: string = response.message.address;
        return state;
    }

    async wipe(): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('WipeDevice', 'Success');
        return response.message;
    }

    async reset(flags?: trezor.ResetDeviceFlags): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('ResetDevice', 'Success', flags);
        return response.message;
    }

    async load(flags?: trezor.LoadDeviceFlags): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('LoadDevice', 'Success', flags);
        return response.message;
    }

    async applyFlags(params: trezor.Flags): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('ApplyFlags', 'Success', params);
        return response.message;
    }

    async applySettings(params: trezor.ApplySettings): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('ApplySettings', 'Success', params);
        return response.message;
    }

    async backupDevice(): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('BackupDevice', 'Success');
        return response.message;
    }

    async changePin(params: trezor.ChangePin): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('ChangePin', 'Success', params);
        return response.message;
    }

    async firmwareErase(params: trezor.FirmwareErase): Promise<trezor.Success | 'FirmwareRequest'> {
        const response: MessageResponse<trezor.Success> = await this.typedCall(
            'FirmwareErase',
            this.device.features.major_version === 1 ? 'Success' : 'FirmwareRequest',
            params,
        );
        return response.message;
    }

    async firmwareUpload(params: trezor.FirmwareUpload): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('FirmwareUpload', 'Success', params);
        return response.message;
    }

    async recoveryDevice(params: trezor.RecoverDeviceSettings): Promise<trezor.Success> {
        const response: MessageResponse<trezor.Success> = await this.typedCall('RecoveryDevice', 'Success', params);
        return response.message;
    }

    // Sends an async message to the opened device.
    async call(type: string, msg: Object = {}): Promise<DefaultMessageResponse> {
        const logMessage: Object = filterForLog(type, msg);

        if (this.debug) {
            // eslint-disable-next-line no-console
            console.log('[DeviceCommands] [call] Sending', type, logMessage, this.transport);
        }

        try {
            this.callPromise = this.transport.call(this.sessionId, type, msg, false);
            const res: DefaultMessageResponse = await this.callPromise;
            const logMessage = filterForLog(res.type, res.message);
            if (this.debug) {
                // eslint-disable-next-line no-console
                console.log('[DeviceCommands] [call] Received', res.type, logMessage);
            }
            return res;
        } catch (error) {
            if (this.debug) {
                // eslint-disable-next-line no-console
                console.warn('[DeviceCommands] [call] Received error', error);
            }
            // TODO: throw trezor error
            throw error;
        }
    }

    async typedCall(type: string, resType: string, msg: Object = {}): Promise<DefaultMessageResponse> {
        if (this.disposed) {
            throw ERRORS.TypedError('Runtime', 'typedCall: DeviceCommands already disposed');
        }

        const response: DefaultMessageResponse = await this._commonCall(type, msg);
        try {
            assertType(response, resType);
        } catch (error) {
            // handle possible race condition
            // Bridge may have some unread message in buffer, read it
            await this.transport.read(this.sessionId, false);
            // throw error anyway, next call should be resolved properly
            throw error;
        }
        return response;
    }

    async _commonCall(type: string, msg: Object): Promise<DefaultMessageResponse> {
        const resp = await this.call(type, msg);
        return this._filterCommonTypes(resp);
    }

    async _filterCommonTypes(res: DefaultMessageResponse): Promise<DefaultMessageResponse> {
        if (res.type === 'Failure') {
            const { code, message } = res.message;
            // pass code and message from firmware error
            return Promise.reject(new ERRORS.TrezorError(code, message));
        }

        if (res.type === 'Features') {
            return Promise.resolve(res);
        }

        if (res.type === 'ButtonRequest') {
            if (res.message.code === 'ButtonRequest_PassphraseEntry') {
                this.device.emit(DEVICE.PASSPHRASE_ON_DEVICE, this.device);
            } else {
                this.device.emit(DEVICE.BUTTON, this.device, res.message.code);
            }
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
            const state = this.device.getInternalState();
            const legacy = this.device.useLegacyPassphrase();
            const legacyT1 = legacy && this.device.isT1();

            // T1 fw lower than 1.9.0, passphrase is cached in internal state
            if (legacyT1 && typeof state === 'string') {
                return this._commonCall('PassphraseAck', { passphrase: state });
            }

            // TT fw lower than 2.3.0, entering passphrase on device
            if (legacy && res.message.on_device) {
                this.device.emit(DEVICE.PASSPHRASE_ON_DEVICE, this.device);
                return this._commonCall('PassphraseAck', { state });
            }

            return this._promptPassphrase().then(
                response => {
                    const { passphrase, passphraseOnDevice, cache } = response;
                    if (legacyT1) {
                        this.device.setInternalState(cache ? passphrase : undefined);
                        return this._commonCall('PassphraseAck', { passphrase });
                    } else if (legacy) {
                        return this._commonCall('PassphraseAck', { passphrase, state });
                    } else {
                        return !passphraseOnDevice ? this._commonCall('PassphraseAck', { passphrase }) : this._commonCall('PassphraseAck', { on_device: true });
                    }
                },
                err => {
                    return this._commonCall('Cancel', {}).catch(e => {
                        throw err || e;
                    });
                }
            );
        }

        // TT fw lower than 2.3.0, device send his current state
        // new passphrase design set this value from `features.session_id`
        if (res.type === 'PassphraseStateRequest') {
            const state: string = res.message.state;
            this.device.setInternalState(state);
            return this._commonCall('PassphraseStateAck', {});
        }

        if (res.type === 'WordRequest') {
            return this._promptWord(res.message.type).then(
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

    async _getAddressForNetworkType(networkType: ?string) {
        switch (networkType) {
            case NETWORK.TYPES.cardano:
                return await this.typedCall('CardanoGetAddress', 'CardanoAddress', {
                    address_parameters: {
                        address_type: 8, // Byron
                        address_n: [toHardened(44), toHardened(1815), toHardened(0), 0, 0],
                    },
                    protocol_magic: 42,
                    network_id: 0,
                });
            default:
                return await this.typedCall('GetAddress', 'Address', {
                    address_n: [toHardened(44), toHardened(1), toHardened(0), 0, 0],
                    coin_name: 'Testnet',
                    script_type: 'SPENDADDRESS',
                });
        }
    }

    _promptPin(type: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.device.listenerCount(DEVICE.PIN) > 0) {
                this._cancelableRequest = reject;
                this.device.emit(DEVICE.PIN, this.device, type, (err, pin) => {
                    this._cancelableRequest = undefined;
                    if (err || pin == null) {
                        reject(err);
                    } else {
                        resolve(pin);
                    }
                });
            } else {
                // eslint-disable-next-line no-console
                console.warn('[DeviceCommands] [call] PIN callback not configured, cancelling request');
                reject(ERRORS.TypedError('Runtime', '_promptPin: PIN callback not configured'));
            }
        });
    }

    _promptPassphrase(): Promise<PassphrasePromptResponse> {
        return new Promise((resolve, reject) => {
            if (this.device.listenerCount(DEVICE.PASSPHRASE) > 0) {
                this._cancelableRequest = reject;
                this.device.emit(DEVICE.PASSPHRASE, this.device, (response: PassphrasePromptResponse, error?: Error) => {
                    this._cancelableRequest = undefined;
                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            } else {
                // eslint-disable-next-line no-console
                console.warn('[DeviceCommands] [call] Passphrase callback not configured, cancelling request');
                reject(ERRORS.TypedError('Runtime', '_promptPassphrase: Passphrase callback not configured'));
            }
        });
    }

    _promptWord(type: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._cancelableRequest = reject;
            this.device.emit(DEVICE.WORD, this.device, type, (err, word) => {
                this._cancelableRequest = undefined;
                if (err || word == null) {
                    reject(err);
                } else {
                    resolve(word.toLocaleLowerCase());
                }
            });
        });
    }
    // DebugLink messages

    async debugLinkDecision(msg: any): Promise<void> {
        const session = await this.transport.acquire({
            path: this.device.originalDescriptor.path,
            previous: this.device.originalDescriptor.debugSession,
        }, true);
        await resolveAfter(501, null); // wait for propagation from bridge

        await this.transport.post(session, 'DebugLinkDecision', msg, true);
        await this.transport.release(session, true, true);
        this.device.originalDescriptor.debugSession = null; // make sure there are no leftovers
        await resolveAfter(501, null); // wait for propagation from bridge
    }

    async debugLinkGetState(msg: any): Promise<trezor.DebugLinkState> {
        const session = await this.transport.acquire({
            path: this.device.originalDescriptor.path,
            previous: this.device.originalDescriptor.debugSession,
        }, true);
        await resolveAfter(501, null); // wait for propagation from bridge

        const response: MessageResponse<trezor.DebugLinkState> = await this.transport.call(session, 'DebugLinkGetState', {}, true);
        assertType(response, 'DebugLinkState');
        await this.transport.release(session, true, true);
        await resolveAfter(501, null); // wait for propagation from bridge
        return response.message;
    }

    async getAccountDescriptor(coinInfo: CoinInfo, indexOrPath: number | Array<number>): Promise<?{ descriptor: string; legacyXpub?: string; address_n: number[] }> {
        const address_n = Array.isArray(indexOrPath) ? indexOrPath : getAccountAddressN(coinInfo, indexOrPath);
        if (coinInfo.type === 'bitcoin') {
            const resp = await this.getHDNode(address_n, coinInfo, false);
            return {
                descriptor: resp.xpubSegwit || resp.xpub,
                legacyXpub: resp.xpub,
                address_n,
            };
        } else if (coinInfo.type === 'ethereum') {
            const resp = await this.ethereumGetAddress(address_n, coinInfo, false);
            return {
                descriptor: resp.address,
                address_n,
            };
        } else if (coinInfo.shortcut === 'XRP' || coinInfo.shortcut === 'tXRP') {
            const resp = await this.rippleGetAddress(address_n, false);
            return {
                descriptor: resp.address,
                address_n,
            };
        }

        return;
    }

    // TODO: implement whole "cancel" logic in "trezor-link"
    async cancel() {
        // TEMP: this patch should be implemented in 'trezor-link' instead
        // NOTE:
        // few ButtonRequests can be canceled by design because they are awaiting for user input
        // those are: Pin, Passphrase, Word
        // _cancelableRequest holds reference to the UI promise `reject` method
        // in those cases `this.transport.call` needs to be used
        // calling `this.transport.post` (below) will result with throttling somewhere in low level
        // trezor-link or trezord (not sure which one) will reject NEXT incoming call with "Cancelled" error
        if (this._cancelableRequest) {
            this._cancelableRequest();
            this._cancelableRequest = undefined;
            return;
        }

        /**
         * Bridge version =< 2.0.28 has a bug that doesn't permit it to cancel
         * user interactions in progress, so we have to do it manually.
         */
        const { activeName, version } = this.transport;
        if (
            activeName &&
            activeName === 'BridgeTransport' &&
            versionCompare(version, '2.0.28') < 1
        ) {
            await this.device.legacyForceRelease();
        }

        this.transport.post(this.sessionId, 'Cancel', {}, false);
    }
}
