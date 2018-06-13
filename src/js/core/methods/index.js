/* @flow */
'use strict';

import type { CoreMessage } from 'flowtype';

import AbstractMethod, { MethodInterface } from './AbstractMethod';
import GetFeatures from './GetFeatures';
import GetDeviceState from './GetDeviceState';
import GetPublicKey from './GetPublicKey';
import CipherKeyValue from './CipherKeyValue';
import EthereumGetAddress from './EthereumGetAddress';
import EthereumSignTx from './EthereumSignTx';
import EthereumSignMessage from './EthereumSignMessage';
import EthereumVerifyMessage from './EthereumVerifyMessage';
import CustomMessage from './CustomMessage';
import NEMGetAddress from './NEMGetAddress';
import NEMSignTransaction from './NEMSignTransaction';
import StellarGetPublicKey from './StellarGetPublicKey';
import StellarGetAddress from './StellarGetAddress';
import StellarSignTx from './StellarSignTx';

const classes: {[k: string]: any} = {
    'getFeatures': GetFeatures,
    'getPublicKey': GetPublicKey,
    'getDeviceState': GetDeviceState,
    'cipherKeyValue': CipherKeyValue,
    'ethereumGetAddress': EthereumGetAddress,
    'ethereumSignTx': EthereumSignTx,
    'ethereumSignMessage': EthereumSignMessage,
    'ethereumVerifyMessage': EthereumVerifyMessage,
    'customMessage': CustomMessage,
    'nemGetAddress': NEMGetAddress,
    'nemSignTransaction': NEMSignTransaction,
    'stellarGetPublicKey': StellarGetPublicKey,
    'stellarGetAddress': StellarGetAddress,
    'stellarSignTx': StellarSignTx,
}

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
}

export default find;
