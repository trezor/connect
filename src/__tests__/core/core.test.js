/* @flow */
/* eslint  no-undef: 0 */

import '@babel/polyfill';
import { testFunctions } from './index.js';
import { Core, init as initCore, initTransport } from '../../js/core/Core.js';
import { checkBrowser } from '../../js/utils/browser';
import { settings, testReporter } from './common.js';
import { CoreEventHandler } from './CoreEventHandler.js';

import { CORE_EVENT } from '../../js/constants';
import * as DEVICE from '../../js/constants/device';
import * as IFRAME from '../../js/constants/iframe';

import type {
    TestPayload,
    ExpectedResponse,
    TestFunction,
} from 'flowtype/tests';

let core: Core;

// Functions
const startTestingPayloads = (testPayloads: Array<TestPayload>, expectedResponses: Array<ExpectedResponse>, specNames: Array<string>, isTestingPassphrase: boolean) => {
    if (isTestingPassphrase) {
        it('passphrase', async (done) => {
            const handler = new CoreEventHandler(core, expect, done);
            const shouldWaitForLastResponse = true;
            handler.setPayloads(testPayloads, expectedResponses, shouldWaitForLastResponse);

            handler.startListening();
            handler._handleDeviceConnect(null, false);
        });
    } else {
        for (let i = 0; i < testPayloads.length; i++) {
            const payload = testPayloads[i];
            const expectedResponse = expectedResponses[i];
            const specName = specNames[i];

            it(specName, async (done) => {
                const handler = new CoreEventHandler(core, expect, done);
                const shouldWaitForLastResponse = false;
                handler.setPayloads(payload, expectedResponse, shouldWaitForLastResponse);

                handler.startListening();
                handler._handleDeviceConnect(null, false);
            });
        }
    }
};

const MNEMONICS = {
    'mnemonic_12': ['alcohol woman abuse must during monitor noble actual mixed trade anger aisle'],
    'mnemonic_all': ['all all all all all all all all all all all all'],
    'mnemonic_abandon': ['abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'],
};

const MNEMONICS_SECRET = {
    'mnemonic_12': '616c636f686f6c20776f6d616e206162757365206d75737420647572696e67206d6f6e69746f72206e6f626c652061637475616c206d6978656420747261646520616e676572206169736c65',
    'mnemonic_all': '616c6c20616c6c20616c6c20616c6c20616c6c20616c6c20616c6c20616c6c20616c6c20616c6c20616c6c20616c6c',
    'mnemonic_abandon': '6162616e646f6e206162616e646f6e206162616e646f6e206162616e646f6e206162616e646f6e206162616e646f6e206162616e646f6e206162616e646f6e206162616e646f6e206162616e646f6e206162616e646f6e2061626f7574',
};

const onBeforeEach = async (test: TestFunction, done: Function): Promise<any> => {
    core = await initCore(settings);
    checkBrowser();

    const mnemonics = Array.isArray(test.mnemonic) ? test.mnemonic : MNEMONICS[test.mnemonic];
    const mnemonicsSecret = typeof test.mnemonic_secret === 'string' ? test.mnemonic_secret : typeof test.mnemonic === 'string' ? MNEMONICS_SECRET[test.mnemonic] : null;
    const handler = new CoreEventHandler(core, () => {}, () => {});
    handler.startListening();

    core.on(CORE_EVENT, (event: any) => {
        if (event.type === DEVICE.CONNECT) {
            core.handleMessage({
                type: IFRAME.CALL,
                id: 1,
                payload: {
                    method: 'debugLinkGetState',
                    device: event.payload,
                },
            }, true);
        } else if (event.id === 1) {
            if (!event.success) {
                console.error('Cannot load debugLink state', event.payload.error);
                throw new Error(event.payload.error);
            }

            if (mnemonics === event.payload.mnemonic || mnemonicsSecret === event.payload.mnemonic_secret) {
                core.removeAllListeners(CORE_EVENT);
                done();
            } else {
                core.handleMessage({
                    type: IFRAME.CALL,
                    id: 2,
                    payload: {
                        method: 'wipeDevice',
                        device: event.payload,
                    },
                }, true);
            }
        } else if (event.id === 2) {
            core.handleMessage({
                type: IFRAME.CALL,
                id: 3,
                payload: {
                    method: 'loadDevice',
                    device: event.payload,
                    mnemonics,
                },
            }, true);
        } else if (event.id === 3) {
            core.removeAllListeners(CORE_EVENT);
            done();
        }
    });
    await initTransport(settings);
};

const runTest = (test: TestFunction, subtestNames: Array<string>) => {
    const { testName } = test;
    const hasSubtests = !!test.subtests;
    const isTestingPassphrase = testName === 'passphrase';

    describe(testName, () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 500000;

        beforeEach(async (done) => {
            await onBeforeEach(test, done);
        });
        afterEach(() => {
            // Deinitialize existing core
            core.onBeforeUnload();
        });

        if (!hasSubtests) {
            const { testPayloads, expectedResponses } = test;

            if (!testPayloads) {
                throw new Error('Test is missing test payloads but doesn\'t have any subtests');
            }

            if (!expectedResponses) {
                throw new Error('Test is missing expected responses but doesn\'t have any subtests');
            }
            const specNames = testPayloads.map(p => p.method);

            startTestingPayloads(testPayloads, expectedResponses, specNames, isTestingPassphrase);
        } else {
            if (!test.subtests) {
                throw new Error('Test is missing subtests but hasSubtest is true');
            }

            const subtestNamesFiltered: Array<string> = subtestNames.length > 0 ? subtestNames : Object.keys(test.subtests);
            subtestNamesFiltered.forEach(name => {
                // $FlowIssue is being handled above - if test.subtests is void throw error
                const { testPayloads, expectedResponses, specName } = test.subtests[name]();
                const specNames: Array<string> = testPayloads.map(p => specName);

                startTestingPayloads(testPayloads, expectedResponses, specNames, isTestingPassphrase);
            });

            // if (subtestNames.length > 0) {
            //     // Subtests were specified by the user
            //     subtestNames.forEach(subtestName => {

            //         const { testPayloads, expectedResponses, specName } = test.subtests[subtestName]();
            //         const specNames: Array<string> = testPayloads.map(p => specName);

            //         startTestingPayloads(testPayloads, expectedResponses, specNames);
            //     });
            // } else {
            //     // No subtests were specified but the test has subtests - run them all
            //     for (const k in test.subtests) {
            //         const { testPayloads, expectedResponses, specName } = test.subtests[k]();
            //         const specNames: Array<string> = testPayloads.map(p => specName);

            //         startTestingPayloads(testPayloads, expectedResponses, specNames);
            //     }
            // }
        }
    });
};
// Functions: END

jasmine.getEnv().addReporter(testReporter);
// 'ethereumSignTransaction/noData ethereumSignTransaction/data ethereumSignTransaction/dataEip155 getPublicKey'
const tests: string = __karma__.config.tests.trim();
// [ethereumSignTransaction/noData, ethereumSignTransaction/data, ethereumSignTransaction/dataEip155, getPublicKey]
const testsArr = tests.split(' ');

// config: {
//      'testName1': ['subtestName1', 'subtestName2'],
//      'testName2': [],
// }
const config = {};
testsArr.forEach(testItem => {
    const splitted = testItem.split('/');

    const testName = splitted[0];
    let subtestName = '';
    if (splitted.length === 2) {
        subtestName = splitted[1];
    }

    if (config[testName]) {
        if (subtestName !== '') {
            config[testName].push(subtestName);
        }
    } else {
        if (subtestName !== '') {
            config[testName] = [subtestName];
        } else {
            config[testName] = [];
        }
    }
});

// Iterate through the config object and run each test
for (const testName in config) {
    const subtestNames: Array<string> = config[testName];

    const test: TestFunction = testFunctions[testName]();
    runTest(test, subtestNames);
}
