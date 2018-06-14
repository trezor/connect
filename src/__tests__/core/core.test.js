//import { Core, CORE_EVENT, init as initCore, initTransport } from './src/js/core/Core.js';
//import { parse as parseSettings } from '../entrypoints/ConnectSettings';

import 'babel-polyfill';
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import * as POPUP from '../../js/constants/popup';
import * as UI from '../../js/constants/ui';

import { getPublicKeyTests } from './getPublicKey.spec.js';
import { ethereumGetAddressTests } from './ethereumGetAddress.spec.js';

const testFunctions = {
    getPublicKey: getPublicKeyTests,
    ethereumGetAddress: ethereumGetAddressTests,
};

const testToRun = __karma__.config.test;

describe(`Testing method`, () => {
    console.warn(testToRun);
    testFunctions[testToRun]();
});
