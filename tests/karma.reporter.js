const path = require('path');
const { spawn } = require('child_process');

const spawnProcess = () => {
    const src = path.resolve(__dirname, './python/main.py');
    const child = spawn('python3', [src], {
        // stdio: [process.stdin, process.stdout, process.stderr],
        stdio: ['ignore', 'ignore', 'ignore'],
    });
    return child;
};

const Reporter = function (rootConfig, helper, logger, emitter) {
    const log = logger.create('reporter.trezor');
    this.onRunStart = function (browsers) {
        log.debug('Start python server');
        if (!global.pythonProcess) {
            global.pythonProcess = spawnProcess();
        }
    };

    // this.onSpecStarted = function () {
    //     console.log("SPEC START");
    //     jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    //     jasmine.addMatchers({
    //         toMatchObject: obj => {
    //             return {
    //                 compare: (actual, expected) => {
    //                     const success = { pass: true, message: 'passed' };
    //                     if (actual === expected) return success;
    //                     if (expected === null || typeof expected !== 'object') {
    //                         return { pass: false, message: 'toMatchObject: "expected" is not a object' };
    //                     }
    //                     const nested = Object.keys(expected).reduce((match, key) => {
    //                         if (typeof expected[key] === 'object') {
    //                             match[key] = jasmine.objectContaining(expected[key]);
    //                         } else {
    //                             match[key] = expected[key];
    //                         }
    //                         return match;
    //                     }, {});
    //                     expect(actual).toEqual(jasmine.objectContaining(nested));
    //                     return success;
    //                 },
    //             };
    //         },
    //     });
    // };

    this.onSpecComplete = function () {
        console.log("SPEC onSpecComplete");
    };

    this.onRunComplete = function () {
        console.log("SPEC onRunComplete");
    };

    this.onExit = function (done) {
        log.debug('Stop python server');
        if (global.pythonProcess) {
            try {
                process.kill(global.pythonProcess.pid, 'SIGINT');
            } catch (error) {
                log.warn('Kill python server', error);
            }
            global.pythonProcess = null;
        } else {
            log.warn('Kill python server: Server not found');
        }
        done();
    };
};

// const Matchers = function (files) {

// }

Reporter.$inject = ['config', 'helper', 'logger', 'emitter'];

module.exports = {
    // 'framework:trezor': ['factory', Matchers],
    'reporter:trezor': ['type', Reporter],
};
