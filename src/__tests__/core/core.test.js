/* @flow */

import 'babel-polyfill';
import testFunctions from './index.js';
import { getPublicKey } from './getPublicKey.spec.js';

const testToRun = __karma__.config.test;

describe(`Testing method`, () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;
    testFunctions[testToRun]();
});
