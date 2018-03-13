/* @flow */
'use strict';

import type { CoreMessage, UiPromiseResponse } from '../CoreMessage';
import type { MethodCollection } from './parameters';

// import getxpub from './getxpub';
// import discovery from './discovery';
// import composetx from './composetx';
// import signtx from './signtx';
// import custom from './custom';

// import ethereumSignTx from './ethereumSignTx';
// import ethereumGetAddress from './ethereumGetAddress';

// import accountComposetx from './account-composetx';

import getFeatures from './getFeatures';
// import cipherKeyValue from './cipherKeyValue';
import CipherKeyValue from './CipherKeyValue';
import requestDevice from './requestDevice';
import AbstractMethod, { MethodInterface } from './AbstractMethod';


const methods: {[k: string]: MethodCollection} = {

    // 'getxpub': getxpub,
    // 'composetx': composetx,
    // 'signtx': signtx,
    // 'account-composetx': accountComposetx,
    // 'custom': custom,
    // 'discovery': discovery,

    // 'ethereumSignTx': ethereumSignTx,
    // 'ethereumGetAddress': ethereumGetAddress,

    'getFeatures': getFeatures,
    // 'cipherKeyValue': cipherKeyValue,
    'requestDevice': requestDevice,
};

const classes: {[k: string]: any} = {
    'cipherKeyValue': CipherKeyValue
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



