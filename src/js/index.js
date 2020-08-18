/* @flow */
import { UI } from './constants';
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
import type { API } from './types';

const TrezorConnect: API = {
    manifest,
    init: settings => init(settings),
    getSettings,

    on: (type, fn) => {
        eventEmitter.on(type, fn);
    },

    off: (type, fn) => {
        eventEmitter.removeListener(type, fn);
    },

    removeAllListeners: () => {
        eventEmitter.removeAllListeners();
    },

    uiResponse,

    // methods

    blockchainGetAccountBalanceHistory: params => {
        return call({ method: 'blockchainGetAccountBalanceHistory', ...params });
    },

    blockchainGetCurrentFiatRates: params => {
        return call({ method: 'blockchainGetCurrentFiatRates', ...params });
    },

    blockchainGetFiatRatesForTimestamps: params => {
        return call({ method: 'blockchainGetFiatRatesForTimestamps', ...params });
    },

    blockchainDisconnect: params => {
        return call({ method: 'blockchainDisconnect', ...params });
    },

    blockchainEstimateFee: params => {
        return call({ method: 'blockchainEstimateFee', ...params });
    },

    blockchainGetTransactions: params => {
        return call({ method: 'blockchainGetTransactions', ...params });
    },

    blockchainSetCustomBackend: params => {
        return call({ method: 'blockchainSetCustomBackend', ...params });
    },

    blockchainSubscribe: params => {
        return call({ method: 'blockchainSubscribe', ...params });
    },

    blockchainSubscribeFiatRates: params => {
        return call({ method: 'blockchainSubscribeFiatRates', ...params });
    },

    blockchainUnsubscribe: params => {
        return call({ method: 'blockchainUnsubscribe', ...params });
    },

    blockchainUnsubscribeFiatRates: params => {
        return call({ method: 'blockchainUnsubscribeFiatRates', ...params });
    },

    customMessage: params => {
        return customMessage(params);
    },

    requestLogin: params => {
        return requestLogin(params);
    },

    cardanoGetAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'cardanoGetAddress', ...params, useEventListener });
    },

    cardanoGetPublicKey: params => {
        return call({ method: 'cardanoGetPublicKey', ...params });
    },

    cardanoSignTransaction: params => {
        return call({ method: 'cardanoSignTransaction', ...params });
    },

    cipherKeyValue: params => {
        return call({ method: 'cipherKeyValue', ...params });
    },

    composeTransaction: params => {
        return call({ method: 'composeTransaction', ...params });
    },

    debugLinkDecision: params => {
        return call({ method: 'debugLinkDecision', ...params });
    },

    debugLinkGetState: params => {
        return call({ method: 'debugLinkGetState', ...params });
    },

    ethereumGetAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'ethereumGetAddress', ...params, useEventListener });
    },

    ethereumGetPublicKey: params => {
        return call({ method: 'ethereumGetPublicKey', ...params });
    },

    ethereumSignMessage: params => {
        return call({ method: 'ethereumSignMessage', ...params });
    },

    ethereumSignTransaction: params => {
        return call({ method: 'ethereumSignTransaction', ...params });
    },

    ethereumVerifyMessage: params => {
        return call({ method: 'ethereumVerifyMessage', ...params });
    },

    getAccountInfo: params => {
        return call({ method: 'getAccountInfo', ...params });
    },

    getAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'getAddress', ...params, useEventListener });
    },

    getDeviceState: params => {
        return call({ method: 'getDeviceState', ...params });
    },

    getFeatures: params => {
        return call({ method: 'getFeatures', ...params });
    },

    getPublicKey: params => {
        return call({ method: 'getPublicKey', ...params });
    },

    liskGetAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'liskGetAddress', ...params, useEventListener });
    },

    liskGetPublicKey: params => {
        return call({ method: 'liskGetPublicKey', ...params });
    },

    liskSignMessage: params => {
        return call({ method: 'liskSignMessage', ...params });
    },

    liskSignTransaction: params => {
        return call({ method: 'liskSignTransaction', ...params });
    },

    liskVerifyMessage: params => {
        return call({ method: 'liskVerifyMessage', ...params });
    },

    nemGetAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'nemGetAddress', ...params, useEventListener });
    },

    nemSignTransaction: params => {
        return call({ method: 'nemSignTransaction', ...params });
    },

    pushTransaction: params => {
        return call({ method: 'pushTransaction', ...params });
    },

    rippleGetAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'rippleGetAddress', ...params, useEventListener });
    },

    rippleSignTransaction: params => {
        return call({ method: 'rippleSignTransaction', ...params });
    },

    signMessage: params => {
        return call({ method: 'signMessage', ...params });
    },

    signTransaction: params => {
        return call({ method: 'signTransaction', ...params });
    },

    stellarGetAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'stellarGetAddress', ...params, useEventListener });
    },

    stellarSignTransaction: params => {
        return call({ method: 'stellarSignTransaction', ...params });
    },

    tezosGetAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'tezosGetAddress', ...params, useEventListener });
    },

    tezosGetPublicKey: params => {
        return call({ method: 'tezosGetPublicKey', ...params });
    },

    tezosSignTransaction: params => {
        return call({ method: 'tezosSignTransaction', ...params });
    },

    eosGetPublicKey: params => {
        return call({ method: 'eosGetPublicKey', ...params });
    },

    eosSignTransaction: params => {
        return call({ method: 'eosSignTransaction', ...params });
    },

    binanceGetAddress: params => {
        const useEventListener = eventEmitter.listenerCount(UI.ADDRESS_VALIDATION) > 0;
        return call({ method: 'binanceGetAddress', ...params, useEventListener });
    },

    binanceGetPublicKey: params => {
        return call({ method: 'binanceGetPublicKey', ...params });
    },

    binanceSignTransaction: params => {
        return call({ method: 'binanceSignTransaction', ...params });
    },

    verifyMessage: params => {
        return call({ method: 'verifyMessage', ...params });
    },

    resetDevice: params => {
        return call({ method: 'resetDevice', ...params });
    },

    wipeDevice: params => {
        return call({ method: 'wipeDevice', ...params });
    },

    applyFlags: params => {
        return call({ method: 'applyFlags', ...params });
    },

    applySettings: params => {
        return call({ method: 'applySettings', ...params });
    },

    backupDevice: params => {
        return call({ method: 'backupDevice', ...params });
    },

    changePin: params => {
        return call({ method: 'changePin', ...params });
    },

    firmwareUpdate: params => {
        return call({ method: 'firmwareUpdate', ...params });
    },

    recoveryDevice: params => {
        return call({ method: 'recoveryDevice', ...params });
    },

    getCoinInfo: params => {
        return call({ method: 'getCoinInfo', ...params });
    },

    dispose: () => {
        dispose();
    },

    cancel,

    renderWebUSBButton: (className: ?string) => {
        renderWebUSBButton(className);
    },

    disableWebUSB: () => {
        disableWebUSB();
    },
};

export default TrezorConnect;

export * from './constants';
export * from './types';
