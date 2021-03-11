// Karma custom plugin

const { CACHE } = require('./__txcache__');
const { WS_CACHE } = require('./__wscache__');

const Reporter = (rootConfig, logger) => {
    const log = logger.create('reporter.TrezorConnect');

    return {
        onRunStart: () => {
            log.info('Running trezor-connect tests...');
            log.info('FW:', process.env.TESTS_FIRMWARE);
            log.info('Methods:', process.env.TESTS_INCLUDED_METHODS || 'All');
        },

        onSpecStart: (_browser, spec) => {
            log.warn('onSpecStart', spec);
        },

        onSpecComplete: (_browser, spec) => {
            log.info('onSpecComplete...', spec.fullName);
            log.info('onSpecComplete success:', spec.success);
        },

        onRunComplete: () => {
            log.warn('onRunComplete');
        },

        onExit: done => {
            log.warn('onExit');
            done();
        },
    };
};

Reporter.$inject = ['config', 'logger'];

// node.js "fs" package is not available in karma (browser) env.
// stringify CACHE object and inject it into a browser global.TestUtils context, same as jest.setup
const Preprocessor = logger => (content, file, done) => {
    const log = logger.create('preprocessor.TrezorConnect');
    log.info('Processing cache');
    done(
        `const CACHE = ${JSON.stringify(CACHE)};
        const TESTS_USE_TX_CACHE = ${process.env.TESTS_USE_TX_CACHE};
        TestUtils.WS_CACHE = ${JSON.stringify(WS_CACHE)};
        TestUtils.TX_CACHE = (txs, force = false) => { if (TESTS_USE_TX_CACHE === false && !force) return []; return txs.map(hash => CACHE[hash]); };`,
    );
};
Preprocessor.$inject = ['logger'];

module.exports = {
    'preprocessor:TrezorConnect': ['factory', Preprocessor],
    'reporter:TrezorConnect': ['type', Reporter],
};
