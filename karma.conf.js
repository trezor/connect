// https://raw.githubusercontent.com/zyml/es6-karma-jasmine-webpack-boilerplate/master/karma.config.js

import path from 'path';
import webpackConfig from './webpack/config.karma.babel';

module.exports = function (config) {
    config.set({
        browserNoActivityTimeout: 1000000,
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // plugins: ['karma-webpack', 'karma-jasmine', 'karma-chrome-launcher', 'karma-babel-preprocessor'],

        // list of files / patterns to load in the browser

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            'src/__tests__/core/core.test.js': ['webpack'],
        },

        babelPreprocessor: {
            options: {
                presets: ['env'],
                sourceMap: 'inline',
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function (file) {
                return file.originalPath;
            },
        },

        files: [
            // 'src/flowtype/empty.js',
            // 'src/js/core/Core.js',
            // 'node_modules/babel-polyfill/browser.js',
            'src/__tests__/core/core.test.js',
            { pattern: 'src/__tests__/config.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/coins.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/bridge/releases.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/firmware/1/releases.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/firmware/2/releases.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/messages/messages.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/messages/messages-v6.json', included: false, served: true, nocache: true },
            { pattern: 'src/data/bridge/latest.txt', included: false, served: true, nocache: true },
        ],

        proxies: {
            // "/iframe.js": "http://localhost:8099/base/src/js/iframe/iframe.js",
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        // browsers: ['chrome_without_security'],
        // browsers: ['ChromeCanary'],
        browsers: ['Chrome'],
        // browsers: ['Firefox'],

        // customLaunchers: {
        //     chrome_without_security: {
        //         base: 'Chrome',
        //         flags: [
        //             '--load-extension=/Users/szymon.lesisz/Library/Application Support/Google/Chrome/Default/Extensions/jcjjhjgimijdkoamemaghajlhegmoclj'
        //         ],
        //         displayName: 'Chrome w/o security'
        //     }
        // },

        client: {
            captureConsole: true,
            clearContext: true,
            useIframe: false,
            runInParent: true,
            // Put the parameters here
            tests: config.tests,
            isEmulatorRunning: config.isEmulatorRunning,
            printDebug: config.printDebug,
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        hostname: 'localhost',
        port: 8099,

        webpackMiddleware: {
            stats: 'errors-only',
        },
        webpack: webpackConfig,
    });
};
