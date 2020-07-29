const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const { runBuild } = require('./runner/webpack');
const { runServer, stopServer } = require('./runner/server');
const { urlParams } = require('./utils/helpers');

jest.setTimeout(60 * 1000);

beforeAll(async () => {
    //const stats = await runBuild();
    //const scriptName = stats.assetsByChunkName['trezor-connect'];

    const scriptName = 'js/trezor-connect.d5698679adcb86af53ec.js';
    await runServer({ scriptName });
});

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

const fixturesPath = path.join(__dirname, 'fixtures');
const fixtures = fs.readdirSync(fixturesPath);
fixtures.forEach(fixture => {
    const fixturePath = path.join(fixturesPath, fixture);
    const { name, params, tests } = require(fixturePath);

    let browser;
    let page;

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
            it(test.description, async () => await test.run(browser, page));
        });
    });
});
