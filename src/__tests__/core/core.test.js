/* @flow */
import 'babel-polyfill';
import testFunctions from './index.js';
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, CoreEventHandler } from './common.js';

const testToRun: String = __karma__.config.test;
const subtestsToRun: String = __karma__.config.subtests;

// test object
// {
//     subtest1: {
//         testPayloads: [{}],
//         expectedResponses: [{}],
//     },
//     subtest2: {
//         testPayloads: [{}],
//         expectedResponses: [{}],
//     },
// }

// $FlowIssue: cannot access object's key using string?
const test = testFunctions[testToRun]();

if (subtestsToRun !== '') {
    const subtestNames =  subtestsToRun.split(' ');
    subtestNames.forEach(subtestName => {
        const { testName } = test;
        const { testPayloads, expectedResponses, /* specNames */ } = test[subtestName]();
        start(testPayloads, expectedResponses, testName/* , specNames */);
    });
} else {
    // Test has no subtests
    const { testPayloads, expectedResponses, testName, /* specNames */ } = test;
    start(testPayloads, expectedResponses, testName/* , specNames */);
}


function start(testPayloads, expectedResponses, testName/* , specNames */) {
    if (testPayloads.length !== expectedResponses.length) {
        throw new Error('Different number of payloads and expected responses');
    }
    // if (testPayloads.length !== specNames.length) {
    //     throw new Error('Different number of payloads and spec names');
    // }

    describe(testName, () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;
        let core: Core;

        beforeEach(async (done) => {
            core = await initCore(settings);
            checkBrowser();
            done();
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];

            it(/* specNames */'', async (done) => {
                const handler = new CoreEventHandler(core, payload, expectedResponse, expect, done);
                handler.startListening();
                await initTransport(settings);
            });
        }
    });
}
