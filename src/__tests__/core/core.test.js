/* @flow */

import 'babel-polyfill';
import * as tests from './index.js';

import { jasmine, describe } from 'flowtype/jasmine';
import { __karma__ } from 'flowtype/karma';

const testToRun = __karma__.config.test;

describe(`Testing method`, () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 250000;
    tests[testToRun]();
});
