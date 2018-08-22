/* @flow */
'use strict';

import type { CoreMessage } from '../../types';

import AbstractMethod from './AbstractMethod';

import CipherKeyValue from './CipherKeyValue';
import ComposeTransaction from './ComposeTransaction';
import CustomMessage from './CustomMessage';
import EthereumGetAddress from './EthereumGetAddress';
import EthereumSignMessage from './EthereumSignMessage';
import EthereumSignTransaction from './EthereumSignTransaction';
import EthereumVerifyMessage from './EthereumVerifyMessage';
import GetAccountInfo from './GetAccountInfo';
import GetAddress from './GetAddress';
import GetDeviceState from './GetDeviceState';
import GetFeatures from './GetFeatures';
import GetPublicKey from './GetPublicKey';
import PushTransaction from './PushTransaction';
import RequestLogin from './RequestLogin';
import NEMGetAddress from './NEMGetAddress';
import NEMSignTransaction from './NEMSignTransaction';
import SignMessage from './SignMessage';
import SignTransaction from './SignTransaction';
import StellarGetAddress from './StellarGetAddress';
import StellarSignTransaction from './StellarSignTransaction';
import LiskGetAddress from './LiskGetAddress';
import LiskSignMessage from './LiskSignMessage';
import LiskVerifyMessage from './LiskVerifyMessage';
import LiskSignTransaction from './LiskSignTransaction';
import VerifyMessage from './VerifyMessage';

const classes: {[k: string]: any} = {
    'cipherKeyValue': CipherKeyValue,
    'composeTransaction': ComposeTransaction,
    'customMessage': CustomMessage,
    'ethereumGetAddress': EthereumGetAddress,
    'ethereumSignMessage': EthereumSignMessage,
    'ethereumSignTransaction': EthereumSignTransaction,
    'ethereumVerifyMessage': EthereumVerifyMessage,
    'getAccountInfo': GetAccountInfo,
    'getAddress': GetAddress,
    'getDeviceState': GetDeviceState,
    'getFeatures': GetFeatures,
    'getPublicKey': GetPublicKey,
    'pushTransaction': PushTransaction,
    'requestLogin': RequestLogin,
    'nemGetAddress': NEMGetAddress,
    'nemSignTransaction': NEMSignTransaction,
    'signMessage': SignMessage,
    'signTransaction': SignTransaction,
    'stellarGetAddress': StellarGetAddress,
    'stellarSignTransaction': StellarSignTransaction,
    'liskGetAddress': LiskGetAddress,
    'liskSignMessage': LiskSignMessage,
    'liskVerifyMessage': LiskVerifyMessage,
    'verifyMessage': VerifyMessage,
    'liskSignTransaction': LiskSignTransaction,
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
