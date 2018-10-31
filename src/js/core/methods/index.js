/* @flow */
'use strict';

import type { CoreMessage } from '../../types';

import AbstractMethod from './AbstractMethod';

import BlockchainDisconnect from './BlockchainDisconnect';
import BlockchainSubscribe from './BlockchainSubscribe';
import CardanoGetAddress from './CardanoGetAddress';
import CardanoGetPublicKey from './CardanoGetPublicKey';
import CardanoSignTransaction from './CardanoSignTransaction';
import CipherKeyValue from './CipherKeyValue';
import ComposeTransaction from './ComposeTransaction';
import CustomMessage from './CustomMessage';
import EthereumGetAccountInfo from './EthereumGetAccountInfo';
import EthereumGetAddress from './EthereumGetAddress';
import EthereumSignMessage from './EthereumSignMessage';
import EthereumSignTransaction from './EthereumSignTransaction';
import EthereumVerifyMessage from './EthereumVerifyMessage';
import GetAccountInfo from './GetAccountInfo';
import GetAddress from './GetAddress';
import GetDeviceState from './GetDeviceState';
import GetFeatures from './GetFeatures';
import GetPublicKey from './GetPublicKey';
import LiskGetAddress from './LiskGetAddress';
import LiskGetPublicKey from './LiskGetPublicKey';
import LiskSignMessage from './LiskSignMessage';
import LiskVerifyMessage from './LiskVerifyMessage';
import LiskSignTransaction from './LiskSignTransaction';
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
import VerifyMessage from './VerifyMessage';
import WipeDevice from './WipeDevice';

const classes: {[k: string]: any} = {
    'blockchainDisconnect': BlockchainDisconnect,
    'blockchainSubscribe': BlockchainSubscribe,
    'cardanoGetAddress': CardanoGetAddress,
    'cardanoGetPublicKey': CardanoGetPublicKey,
    'cardanoSignTransaction': CardanoSignTransaction,
    'cipherKeyValue': CipherKeyValue,
    'composeTransaction': ComposeTransaction,
    'customMessage': CustomMessage,
    'ethereumGetAccountInfo': EthereumGetAccountInfo,
    'ethereumGetAddress': EthereumGetAddress,
    'ethereumSignMessage': EthereumSignMessage,
    'ethereumSignTransaction': EthereumSignTransaction,
    'ethereumVerifyMessage': EthereumVerifyMessage,
    'getAccountInfo': GetAccountInfo,
    'getAddress': GetAddress,
    'getDeviceState': GetDeviceState,
    'getFeatures': GetFeatures,
    'getPublicKey': GetPublicKey,
    'liskGetAddress': LiskGetAddress,
    'liskGetPublicKey': LiskGetPublicKey,
    'liskSignMessage': LiskSignMessage,
    'liskSignTransaction': LiskSignTransaction,
    'liskVerifyMessage': LiskVerifyMessage,
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
    'verifyMessage': VerifyMessage,
    'wipeDevice': WipeDevice,
};

export const find = (message: CoreMessage): AbstractMethod => {
    if (!message.payload) {
        throw new Error('Message payload not found');
    }

    if (!message.payload.method || typeof message.payload.method !== 'string') {
        throw new Error('Message method is not set');
    }

    if (classes[message.payload.method]) {
        return new classes[message.payload.method](message);
    }

    throw new Error(`Method ${message.payload.method} not found`);
};

export default find;
