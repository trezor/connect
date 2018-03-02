/* @flow */
'use strict';

import type { MethodCollection } from './parameters';

// import { method as getxpub, confirmation as getxpubConfirmation, params as getxpubParams } from './getxpub';
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
};

export const find = (name: string): ?MethodCollection => {
    if (methods[name]) {
        return methods[name];
    }
    return null;
};

export default find;
