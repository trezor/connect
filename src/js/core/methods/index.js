/* @flow */
'use strict';

import type { MethodCollection } from './parameters';

// import getxpub from './getxpub';
// import discovery from './discovery';
// import composetx from './composetx';
// import signtx from './signtx';
// import custom from './custom';

// import ethereumSignTx from './ethereumSignTx';
// import ethereumGetAddress from './ethereumGetAddress';

// import accountComposetx from './account-composetx';

// import getFeatures from './getFeatures';
import cipherKeyValue from './cipherKeyValue';
import requestDevice from './requestDevice';

const methods: {[k: string]: MethodCollection} = {

    // 'getxpub': getxpub,
    // 'composetx': composetx,
    // 'signtx': signtx,
    // 'account-composetx': accountComposetx,
    // 'custom': custom,
    // 'discovery': discovery,

    // 'ethereumSignTx': ethereumSignTx,
    // 'ethereumGetAddress': ethereumGetAddress,

    // 'getFeatures': getFeatures,
    'cipherKeyValue': cipherKeyValue,
    'requestDevice': requestDevice,
};

export const find = (name: string): ?MethodCollection => {
    if (methods[name]) {
        return methods[name];
    }
    return null;
};

export default find;


export const find2 = (params: Object): ?AbstractMethod => {

}

export class AbstractMethod {
    constructor(params: Object) {

    }
}

