/* @flow */
'use strict';

import type { CoreMessage, UiPromiseResponse } from '../CoreMessage';
import type { MethodCollection } from './parameters';

import getFeatures from './getFeatures';
import requestDevice from './requestDevice';

import AbstractMethod, { MethodInterface } from './AbstractMethod';
import CipherKeyValue from './CipherKeyValue';
import EthereumGetAddress from './EthereumGetAddress';
import EthereumSignTx from './EthereumSignTx';


const methods: {[k: string]: MethodCollection} = {
    'getFeatures': getFeatures,
    'requestDevice': requestDevice,
};

const classes: {[k: string]: any} = {
    'cipherKeyValue': CipherKeyValue,
    'ethereumGetAddress': EthereumGetAddress,
    'ethereumSignTx': EthereumSignTx,
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



