/* @flow */

import { UI_EVENT, DEVICE_EVENT, RESPONSE_EVENT, TRANSPORT_EVENT, BLOCKCHAIN_EVENT } from './constants';
import * as TRANSPORT from './constants/transport';
import * as IFRAME from './constants/iframe';
import * as UI from './constants/ui';
import * as DEVICE from './constants/device';
import * as BLOCKCHAIN from './constants/blockchain';

import * as $T from './types';
import {
    eventEmitter,
    manifest,
    init,
    call,
    getSettings,
    customMessage,
    requestLogin,
    uiResponse,
    renderWebUSBButton,
    disableWebUSB,
    cancel,
    dispose,
} from './env/node';

class TrezorConnect {
    static manifest = (data: Object): void => {
        manifest(data);
    }

    static getSettings: $T.GetSettings = async () => {
        return await getSettings();
    }

    static init = async (settings: $T.Settings): Promise<void> => {
        return await init(settings);
    }

    static on: $T.EventListener = (type, fn): void => {
        eventEmitter.on(type, fn);
    }

    static off: $T.EventListener = (type, fn): void => {
        eventEmitter.removeListener(type, fn);
    }

    static uiResponse = (response: $T.UiResponse): void => {
        uiResponse(response);
    }

    // methods

    static blockchainDisconnect: $T.BlockchainDisconnect = async (params) => {
        return await call({ method: 'blockchainDisconnect', ...params });
    }

    static blockchainEstimateFee: $T.BlockchainEstimateFee = async (params) => {
        return await call({ method: 'blockchainEstimateFee', ...params });
    }

    static blockchainGetTransactions: $T.BlockchainGetTransactions = async (params) => {
        return await call({ method: 'blockchainGetTransactions', ...params });
    }

    static blockchainSubscribe: $T.BlockchainSubscribe = async (params) => {
        return await call({ method: 'blockchainSubscribe', ...params });
    }

    static blockchainUnsubscribe: $T.BlockchainSubscribe = async (params) => {
        return await call({ method: 'blockchainUnsubscribe', ...params });
    }

    static customMessage: $T.CustomMessage = async (params) => {
        return await customMessage(params);
    }

    static requestLogin: $T.RequestLogin = async (params) => {
        return await requestLogin(params);
    }

    static resetDevice: $T.ResetDevice = async (params) => {
        return await call({ method: 'resetDevice', ...params });
    }

    static cardanoGetAddress: $T.CardanoGetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'cardanoGetAddress', ...params, useEventListener });
    }

    static cardanoGetPublicKey: $T.CardanoGetPublicKey = async (params) => {
        return await call({ method: 'cardanoGetPublicKey', ...params });
    }

    static cardanoSignTransaction: $T.CardanoSignTransaction = async (params) => {
        return await call({ method: 'cardanoSignTransaction', ...params });
    }

    static cipherKeyValue: $T.CipherKeyValue = async (params) => {
        return await call({ method: 'cipherKeyValue', ...params });
    }

    static composeTransaction: $T.ComposeTransaction = async (params) => {
        return await call({ method: 'composeTransaction', ...params });
    }

    static debugLinkDecision: $T.DebugLinkDecision = async (params) => {
        return await call({ method: 'debugLinkDecision', ...params });
    }

    static debugLinkGetState: $T.DebugLinkGetState = async (params) => {
        return await call({ method: 'debugLinkGetState', ...params });
    }

    static ethereumGetAddress: $T.EthereumGetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'ethereumGetAddress', ...params, useEventListener });
    }

    static ethereumGetPublicKey: $T.EthereumGetPublicKey = async (params) => {
        return await call({ method: 'ethereumGetPublicKey', ...params });
    }

    static ethereumSignMessage: $T.EthereumSignMessage = async (params) => {
        return await call({ method: 'ethereumSignMessage', ...params });
    }

    static ethereumSignTransaction: $T.EthereumSignTransaction = async (params) => {
        return await call({ method: 'ethereumSignTransaction', ...params });
    }

    static ethereumVerifyMessage: $T.EthereumVerifyMessage = async (params) => {
        return await call({ method: 'ethereumVerifyMessage', ...params });
    }

    static getAccountInfo: $T.GetAccountInfo = async (params) => {
        return await call({ method: 'getAccountInfo', ...params });
    }

    static getAddress: $T.GetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'getAddress', ...params, useEventListener });
    }

    static getDeviceState: $T.GetDeviceState = async (params) => {
        return await call({ method: 'getDeviceState', ...params });
    }

    static getFeatures: $T.GetFeatures = async (params) => {
        return await call({ method: 'getFeatures', ...params });
    }

    static getPublicKey: $T.GetPublicKey = async (params) => {
        return await call({ method: 'getPublicKey', ...params });
    }

    static liskGetAddress: $T.LiskGetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'liskGetAddress', ...params, useEventListener });
    }

    static liskGetPublicKey: $T.LiskGetPublicKey = async (params) => {
        return await call({ method: 'liskGetPublicKey', ...params });
    }

    static liskSignMessage: $T.LiskSignMessage = async (params) => {
        return await call({ method: 'liskSignMessage', ...params });
    }

    static liskSignTransaction: $T.LiskSignTransaction = async (params) => {
        return await call({ method: 'liskSignTransaction', ...params });
    }

    static liskVerifyMessage: $T.LiskVerifyMessage = async (params) => {
        return await call({ method: 'liskVerifyMessage', ...params });
    }

    static nemGetAddress: $T.NEMGetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'nemGetAddress', ...params, useEventListener });
    }

    static nemSignTransaction: $T.NEMSignTransaction = async (params) => {
        return await call({ method: 'nemSignTransaction', ...params });
    }

    static pushTransaction: $T.PushTransaction = async (params) => {
        return await call({ method: 'pushTransaction', ...params });
    }

    static rippleGetAddress: $T.RippleGetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'rippleGetAddress', ...params, useEventListener });
    }

    static rippleSignTransaction: $T.RippleSignTransaction = async (params) => {
        return await call({ method: 'rippleSignTransaction', ...params });
    }

    static signMessage: $T.SignMessage = async (params) => {
        return await call({ method: 'signMessage', ...params });
    }

    static signTransaction: $T.SignTransaction = async (params) => {
        return await call({ method: 'signTransaction', ...params });
    }

    static stellarGetAddress: $T.StellarGetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'stellarGetAddress', ...params, useEventListener });
    }

    static stellarSignTransaction: $T.StellarSignTransaction = async (params) => {
        return await call({ method: 'stellarSignTransaction', ...params });
    }

    static tezosGetAddress: $T.TezosGetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'tezosGetAddress', ...params, useEventListener });
    }

    static tezosGetPublicKey: $T.TezosGetPublicKey = async (params) => {
        return await call({ method: 'tezosGetPublicKey', ...params });
    }

    static tezosSignTransaction: $T.TezosSignTransaction = async (params) => {
        return await call({ method: 'tezosSignTransaction', ...params });
    }

    static eosGetPublicKey: $T.EosGetPublicKey = async (params) => {
        return await call({ method: 'eosGetPublicKey', ...params });
    }

    static eosSignTransaction: $T.EosSignTx = async (params) => {
        return await call({ method: 'eosSignTransaction', ...params });
    }

    static binanceGetAddress: $T.BinanceGetAddress = async (params) => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return await call({ method: 'binanceGetAddress', ...params, useEventListener });
    }

    static binanceGetPublicKey: $T.BinanceGetPublicKey = async (params) => {
        return await call({ method: 'binanceGetPublicKey', ...params });
    }

    static binanceSignTransaction: $T.BinanceSignTransaction = async (params) => {
        return await call({ method: 'binanceSignTransaction', ...params });
    }

    static verifyMessage: $T.VerifyMessage = async (params) => {
        return await call({ method: 'verifyMessage', ...params });
    }

    static wipeDevice: $T.WipeDevice = async (params) => {
        return await call({ method: 'wipeDevice', ...params });
    }

    static applyFlags: $T.ApplyFlags = async (params) => {
        return await call({ method: 'applyFlags', ...params });
    }

    static applySettings: $T.ApplySettings = async (params) => {
        return await call({ method: 'applySettings', ...params });
    }

    static backupDevice: $T.BackupDevice = async () => {
        return await call({ method: 'backupDevice' });
    }

    static changePin: $T.ChangePin = async (params) => {
        return await call({ method: 'changePin', ...params });
    }

    static firmwareUpdate: $T.FirmwareUpload = async (params) => {
        return await call({ method: 'firmwareUpdate', ...params });
    }

    static recoveryDevice: $T.RecoveryDevice = async (params) => {
        return await call({ method: 'recoveryDevice', ...params });
    }

    static dispose = (): void => {
        dispose();
    }

    static cancel = (error?: string): void => {
        cancel(error);
    }

    static renderWebUSBButton = (className: ?string): void => {
        renderWebUSBButton(className);
    }

    static disableWebUSB = async () => {
        disableWebUSB();
    }
}

export default TrezorConnect;

export {
    IFRAME,
    TRANSPORT,
    UI,
    DEVICE,
    BLOCKCHAIN,
    UI_EVENT,
    DEVICE_EVENT,
    TRANSPORT_EVENT,
    BLOCKCHAIN_EVENT,
    RESPONSE_EVENT,
};

export type {
    Device,
    DeviceStatus,
    FirmwareRelease,
    DeviceFirmwareStatus,
    DeviceMode,
    Features,
    DeviceMessageType,
    DeviceMessage,
    UiMessageType,
    UiMessage,
    TransportMessageType,
    TransportMessage,
} from './types';

export * from './types/blockchainEvent';
export * from './types/account';

export type {
    Transaction as EthereumTransaction,
} from './types/ethereum';

export type {
    Transaction as RippleTransaction,
} from './types/ripple';
