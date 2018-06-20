import 'babel-polyfill';
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import { getPublicKeyTests } from './getPublicKey.spec.js';
import { ethereumGetAddressTests } from './ethereumGetAddress.spec.js';
import { ethereumSignMessageTests } from './ethereumSignMessage.spec.js';
import { ethereumSignTxTests } from './ethereumSignTx.spec.js';
import { ethereumVerifyMessageTests } from './ethereumVerifyMessage.spec.js';
import { nemGetAddressTests } from './nemGetAddress.spec.js';

const testFunctions = {
    getPublicKey: getPublicKeyTests,
    ethereumGetAddress: ethereumGetAddressTests,
    ethereumSignMessage: ethereumSignMessageTests,
    ethereumSignTx: ethereumSignTxTests,
    ethereumVerifyMessage: ethereumVerifyMessageTests,
    nemGetAddress: nemGetAddressTests,
};

const testToRun = __karma__.config.test;

describe(`Testing method`, () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 250000;
    testFunctions[testToRun]();
});
