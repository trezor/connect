import 'babel-polyfill';
import * as tests from './index.js';

const testToRun = __karma__.config.test;

describe(`Testing method`, () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 250000;
    tests[testToRun]();
});
