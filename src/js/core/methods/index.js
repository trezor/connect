/* @flow */

import type { CoreMessage } from '../../types';
import { ERRORS } from '../../constants';

import AbstractMethod from './AbstractMethod';

import BlockchainDisconnect from './blockchain/BlockchainDisconnect';
import BlockchainEstimateFee from './blockchain/BlockchainEstimateFee';
import BlockchainGetAccountBalanceHistory from './blockchain/BlockchainGetAccountBalanceHistory';
import BlockchainGetCurrentFiatRates from './blockchain/BlockchainGetCurrentFiatRates';
import BlockchainGetFiatRatesForTimestamps from './blockchain/BlockchainGetFiatRatesForTimestamps';
import BlockchainGetTransactions from './blockchain/BlockchainGetTransactions';
import BlockchainSetCustomBackend from './blockchain/BlockchainSetCustomBackend';
import BlockchainSubscribe from './blockchain/BlockchainSubscribe';
import BlockchainSubscribeFiatRates from './blockchain/BlockchainSubscribeFiatRates';
import BlockchainUnsubscribe from './blockchain/BlockchainUnsubscribe';
import BlockchainUnsubscribeFiatRates from './blockchain/BlockchainUnsubscribeFiatRates';
import CardanoGetAddress from './CardanoGetAddress';
import CardanoGetPublicKey from './CardanoGetPublicKey';
import CardanoSignTransaction from './CardanoSignTransaction';
import CipherKeyValue from './CipherKeyValue';
import ComposeTransaction from './ComposeTransaction';
import CustomMessage from './CustomMessage';
import DebugLinkDecision from './debuglink/DebugLinkDecision';
import DebugLinkGetState from './debuglink/DebugLinkGetState';
import EthereumGetAddress from './EthereumGetAddress';
import EthereumGetPublicKey from './EthereumGetPublicKey';
import EthereumSignMessage from './EthereumSignMessage';
import EthereumSignTransaction from './EthereumSignTransaction';
import EthereumVerifyMessage from './EthereumVerifyMessage';
import GetAccountInfo from './GetAccountInfo';
import GetAddress from './GetAddress';
import GetDeviceState from './GetDeviceState';
import GetFeatures from './GetFeatures';
import GetPublicKey from './GetPublicKey';
import GetSettings from './GetSettings';
import LiskGetAddress from './LiskGetAddress';
import LiskGetPublicKey from './LiskGetPublicKey';
import LiskSignMessage from './LiskSignMessage';
import LiskVerifyMessage from './LiskVerifyMessage';
import LiskSignTransaction from './LiskSignTransaction';
import LoadDevice from './LoadDevice';
import PushTransaction from './PushTransaction';
import RequestLogin from './RequestLogin';
import ResetDevice from './ResetDevice';
import RippleGetAddress from './RippleGetAddress';
import RippleSignTransaction from './RippleSignTransaction';
import NEMGetAddress from './NEMGetAddress';
import NEMSignTransaction from './NEMSignTransaction';
import SignMessage from './SignMessage';
import SignTransaction from './SignTransaction';
import StellarGetAddress from './StellarGetAddress';
import StellarSignTransaction from './StellarSignTransaction';
import TezosGetAddress from './TezosGetAddress';
import TezosGetPublicKey from './TezosGetPublicKey';
import TezosSignTransaction from './TezosSignTransaction';
import EosGetPublicKey from './EosGetPublicKey';
import EosSignTransaction from './EosSignTransaction';
import BinanceGetPublicKey from './BinanceGetPublicKey';
import BinanceGetAddress from './BinanceGetAddress';
import BinanceSignTransaction from './BinanceSignTransaction';
import VerifyMessage from './VerifyMessage';
import WipeDevice from './WipeDevice';
import ApplyFlags from './ApplyFlags';
import ApplySettings from './ApplySettings';
import BackupDevice from './BackupDevice';
import ChangePin from './ChangePin';
import FirmwareUpdate from './FirmwareUpdate';
import RecoveryDevice from './RecoveryDevice';
import GetCoinInfo from './GetCoinInfo';

const classes: { [k: string]: any } = {
    'blockchainDisconnect': BlockchainDisconnect,
    'blockchainEstimateFee': BlockchainEstimateFee,
    'blockchainGetAccountBalanceHistory': BlockchainGetAccountBalanceHistory,
    'blockchainGetCurrentFiatRates': BlockchainGetCurrentFiatRates,
    'blockchainGetFiatRatesForTimestamps': BlockchainGetFiatRatesForTimestamps,
    'blockchainGetTransactions': BlockchainGetTransactions,
    'blockchainSetCustomBackend': BlockchainSetCustomBackend,
    'blockchainSubscribe': BlockchainSubscribe,
    'blockchainSubscribeFiatRates': BlockchainSubscribeFiatRates,
    'blockchainUnsubscribe': BlockchainUnsubscribe,
    'blockchainUnsubscribeFiatRates': BlockchainUnsubscribeFiatRates,
    'cardanoGetAddress': CardanoGetAddress,
    'cardanoGetPublicKey': CardanoGetPublicKey,
    'cardanoSignTransaction': CardanoSignTransaction,
    'cipherKeyValue': CipherKeyValue,
    'composeTransaction': ComposeTransaction,
    'customMessage': CustomMessage,
    'debugLinkDecision': DebugLinkDecision,
    'debugLinkGetState': DebugLinkGetState,
    'ethereumGetAddress': EthereumGetAddress,
    'ethereumGetPublicKey': EthereumGetPublicKey,
    'ethereumSignMessage': EthereumSignMessage,
    'ethereumSignTransaction': EthereumSignTransaction,
    'ethereumVerifyMessage': EthereumVerifyMessage,
    'getAccountInfo': GetAccountInfo,
    'getAddress': GetAddress,
    'getDeviceState': GetDeviceState,
    'getFeatures': GetFeatures,
    'getPublicKey': GetPublicKey,
    'getSettings': GetSettings,
    'liskGetAddress': LiskGetAddress,
    'liskGetPublicKey': LiskGetPublicKey,
    'liskSignMessage': LiskSignMessage,
    'liskSignTransaction': LiskSignTransaction,
    'liskVerifyMessage': LiskVerifyMessage,
    'loadDevice': LoadDevice,
    'pushTransaction': PushTransaction,
    'requestLogin': RequestLogin,
    'resetDevice': ResetDevice,
    'rippleGetAddress': RippleGetAddress,
    'rippleSignTransaction': RippleSignTransaction,
    'nemGetAddress': NEMGetAddress,
    'nemSignTransaction': NEMSignTransaction,
    'signMessage': SignMessage,
    'signTransaction': SignTransaction,
    'stellarGetAddress': StellarGetAddress,
    'stellarSignTransaction': StellarSignTransaction,
    'tezosGetAddress': TezosGetAddress,
    'tezosGetPublicKey': TezosGetPublicKey,
    'tezosSignTransaction': TezosSignTransaction,
    'eosGetPublicKey': EosGetPublicKey,
    'eosSignTransaction': EosSignTransaction,
    'binanceGetPublicKey': BinanceGetPublicKey,
    'binanceGetAddress': BinanceGetAddress,
    'binanceSignTransaction': BinanceSignTransaction,
    'verifyMessage': VerifyMessage,
    'wipeDevice': WipeDevice,
    'applyFlags': ApplyFlags,
    'applySettings': ApplySettings,
    'backupDevice': BackupDevice,
    'changePin': ChangePin,
    'firmwareUpdate': FirmwareUpdate,
    'recoveryDevice': RecoveryDevice,
    'getCoinInfo': GetCoinInfo,
};

export const find = (message: CoreMessage): AbstractMethod => {
    if (!message.payload) {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Message payload not found');
    }

    if (!message.payload.method || typeof message.payload.method !== 'string') {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Message method is not set');
    }

    if (classes[message.payload.method]) {
        return new classes[message.payload.method](message);
    }

    throw ERRORS.TypedError('Method_InvalidParameter', `Method ${message.payload.method} not found`);
};

export default find;
