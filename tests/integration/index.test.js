const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { Controller } = require('../websocket-client');

const { runBuild } = require('./runner/webpack');
const { runServer, stopServer } = require('./runner/server');
const { urlParams } = require('./utils/helpers');

jest.setTimeout(60 * 1000);

const MNEMONICS = {
    'mnemonic_all': 'all all all all all all all all all all all all',
    'mnemonic_12': 'alcohol woman abuse must during monitor noble actual mixed trade anger aisle',
    'mnemonic_abandon': 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
};

/**
 * This part takes care of running the webpack build and executing
 * the web server that will serve the example page as well as the
 * generated files (from webpack).
 */
beforeAll(async () => {
    //const stats = await runBuild();
    //const scriptName = stats.assetsByChunkName['trezor-connect'];

    const scriptName = 'js/trezor-connect.fbc14eaa86f2db96399b.js';
    await runServer({ scriptName });
});

/**
 * After all is done, close the server (otherwise Jest hangs).
 */
afterAll(async () => {
    await stopServer();
});

const defaultParams = {
    manifest: {
        email: 'no@e.mail',
        appUrl: 'http://localhost:3000/',
    },
    debug: true,
};

const firmware = process.env.TESTS_FIRMWARE;

const fixturesPath = path.join(__dirname, 'fixtures');
const fixtures = fs.readdirSync(fixturesPath);
fixtures.forEach(fixture => {
    const fixturePath = path.join(fixturesPath, fixture);
    const { name, params, tests } = require(fixturePath);

    let browser;
    let page;
    let controller;

    beforeAll(async () => {
        controller = new Controller({ url: 'ws://localhost:9001/' });
        //
        await controller.connect();
        // after bridge is stopped, trezor-user-env automatically resolves to use udp transport.
        // this is actually good as we avoid possible race conditions when setting up emulator for 
        // the test using the same transport
        await controller.send({ type: 'bridge-stop' });

        const emulatorStartOpts = { type: 'emulator-start', wipe: true };
        if (firmware) {
            Object.assign(emulatorStartOpts, { version: firmware });
        }
        await controller.send(emulatorStartOpts);

        const mnemonic = MNEMONICS['mnemonic_all'];
        await controller.send({
            type: 'emulator-setup',
            mnemonic,
            pin: '',
            passphrase_protection: false,
            label: 'TrezorT',
            needs_backup: false,
        });
        // after all is done, start bridge again
        await controller.send({ type: 'bridge-start' });

        //
    });

    afterAll(async () => {

    });

    beforeEach(async () => {
        browser = await puppeteer.launch({
            headless: false,
            executablePath: '/run/current-system/sw/bin/chromium',
            ignoreHTTPSErrors: true,
        });
        page = await browser.newPage();
        page.goto(`http://localhost:3000/?p=${urlParams({ ...defaultParams, ...params })}`);
    });

    afterEach(async () => {
        await browser.close();
    });

    describe(name, () => {
        tests.forEach(test => {
            it(test.description, async () => await test.run(browser, page, controller));
        });
    });
});
