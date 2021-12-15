/* @flow */

import type { CoreMessage } from '../../types';
import { ERRORS } from '../../constants';

import AbstractMethod from './AbstractMethod';

import blockchainDisconnect from './blockchain/BlockchainDisconnect';
import blockchainEstimateFee from './blockchain/BlockchainEstimateFee';
import blockchainGetAccountBalanceHistory from './blockchain/BlockchainGetAccountBalanceHistory';
import blockchainGetCurrentFiatRates from './blockchain/BlockchainGetCurrentFiatRates';
import blockchainGetFiatRatesForTimestamps from './blockchain/BlockchainGetFiatRatesForTimestamps';
import blockchainGetTransactions from './blockchain/BlockchainGetTransactions';
import blockchainSetCustomBackend from './blockchain/BlockchainSetCustomBackend';
import blockchainSubscribe from './blockchain/BlockchainSubscribe';
import blockchainSubscribeFiatRates from './blockchain/BlockchainSubscribeFiatRates';
import blockchainUnsubscribe from './blockchain/BlockchainUnsubscribe';
import blockchainUnsubscribeFiatRates from './blockchain/BlockchainUnsubscribeFiatRates';
import cardanoGetAddress from './CardanoGetAddress';
import cardanoGetNativeScriptHash from './CardanoGetNativeScriptHash';
import cardanoGetPublicKey from './CardanoGetPublicKey';
import cardanoSignTransaction from './CardanoSignTransaction';
import cipherKeyValue from './CipherKeyValue';
import composeTransaction from './ComposeTransaction';
import customMessage from './CustomMessage';
import debugLinkDecision from './debuglink/DebugLinkDecision';
import debugLinkGetState from './debuglink/DebugLinkGetState';
import ethereumGetAddress from './EthereumGetAddress';
import ethereumGetPublicKey from './EthereumGetPublicKey';
import ethereumSignMessage from './EthereumSignMessage';
import ethereumSignTransaction from './EthereumSignTransaction';
import ethereumSignTypedData from './EthereumSignTypedData';
import ethereumVerifyMessage from './EthereumVerifyMessage';
import getAccountInfo from './GetAccountInfo';
import getAddress from './GetAddress';
import getDeviceState from './GetDeviceState';
import getFeatures from './GetFeatures';
import getPublicKey from './GetPublicKey';
import getSettings from './GetSettings';
import liskDeprecated from './LiskDeprecated';
import loadDevice from './LoadDevice';
import pushTransaction from './PushTransaction';
import requestLogin from './RequestLogin';
import resetDevice from './ResetDevice';
import rippleGetAddress from './RippleGetAddress';
import rippleSignTransaction from './RippleSignTransaction';
import nemGetAddress from './NEMGetAddress';
import nemSignTransaction from './NEMSignTransaction';
import signMessage from './SignMessage';
import signTransaction from './SignTransaction';
import stellarGetAddress from './StellarGetAddress';
import stellarSignTransaction from './StellarSignTransaction';
import tezosGetAddress from './TezosGetAddress';
import tezosGetPublicKey from './TezosGetPublicKey';
import tezosSignTransaction from './TezosSignTransaction';
import eosGetPublicKey from './EosGetPublicKey';
import eosSignTransaction from './EosSignTransaction';
import binanceGetPublicKey from './BinanceGetPublicKey';
import binanceGetAddress from './BinanceGetAddress';
import binanceSignTransaction from './BinanceSignTransaction';
import verifyMessage from './VerifyMessage';
import wipeDevice from './WipeDevice';
import applyFlags from './ApplyFlags';
import applySettings from './ApplySettings';
import backupDevice from './BackupDevice';
import changePin from './ChangePin';
import firmwareUpdate from './FirmwareUpdate';
import recoveryDevice from './RecoveryDevice';
import getCoinInfo from './GetCoinInfo';
import rebootToBootloader from './RebootToBootloader';

const METHODS = {
    blockchainDisconnect,
    blockchainEstimateFee,
    blockchainGetAccountBalanceHistory,
    blockchainGetCurrentFiatRates,
    blockchainGetFiatRatesForTimestamps,
    blockchainGetTransactions,
    blockchainSetCustomBackend,
    blockchainSubscribe,
    blockchainSubscribeFiatRates,
    blockchainUnsubscribe,
    blockchainUnsubscribeFiatRates,
    cardanoGetAddress,
    cardanoGetNativeScriptHash,
    cardanoGetPublicKey,
    cardanoSignTransaction,
    cipherKeyValue,
    composeTransaction,
    customMessage,
    debugLinkDecision,
    debugLinkGetState,
    ethereumGetAddress,
    ethereumGetPublicKey,
    ethereumSignMessage,
    ethereumSignTransaction,
    ethereumSignTypedData,
    ethereumVerifyMessage,
    getAccountInfo,
    getAddress,
    getDeviceState,
    getFeatures,
    getPublicKey,
    getSettings,
    liskDeprecated,
    loadDevice,
    pushTransaction,
    requestLogin,
    resetDevice,
    rippleGetAddress,
    rippleSignTransaction,
    nemGetAddress,
    nemSignTransaction,
    signMessage,
    signTransaction,
    stellarGetAddress,
    stellarSignTransaction,
    tezosGetAddress,
    tezosGetPublicKey,
    tezosSignTransaction,
    eosGetPublicKey,
    eosSignTransaction,
    binanceGetPublicKey,
    binanceGetAddress,
    binanceSignTransaction,
    verifyMessage,
    wipeDevice,
    applyFlags,
    applySettings,
    backupDevice,
    changePin,
    firmwareUpdate,
    recoveryDevice,
    getCoinInfo,
    rebootToBootloader,
};

export const find = (message: CoreMessage): AbstractMethod => {
    if (!message.payload) {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Message payload not found');
    }

    const { method } = message.payload;
    if (!method || typeof method !== 'string') {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Message method is not set');
    }

    if (METHODS[method]) {
        return new METHODS[method](message);
    }

    throw ERRORS.TypedError('Method_InvalidParameter', `Method ${method} not found`);
};
