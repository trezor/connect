import path from 'path';
import webpack from 'webpack';

module.exports = config => {
    config.set({
        hostname: 'localhost',
        port: 8099,
        autoWatch: false,
        singleRun: true,

        client: {
            captureConsole: true,
            clearContext: true,
            useIframe: false,
            runInParent: true,
        },
        browsers: ['Chrome'],
        concurrency: 0,
        browserNoActivityTimeout: 6000000,
        colors: true,
        logLevel: config.DEBUG,

        // include custom karma.plugin
        plugins: ['karma-*', path.resolve(__dirname, './tests/karma.plugin.js')],
        frameworks: ['jasmine', 'webpack'],
        preprocessors: {
            './tests/karma.setup.js': 'webpack',
            './tests/common.setup.js': 'webpack',
            './tests/__txcache__/index.js': 'TrezorConnect', // use custom preprocessor from karma.plugin
            './tests/device/**/*.test.js': ['webpack'],
        },
        files: [
            { pattern: './tests/karma.setup.js', watched: false },
            { pattern: './tests/common.setup.js', watched: false },
            { pattern: './tests/__txcache__/index.js', watched: false },
            {
                pattern: 'build/**/*.*',
                watched: false,
                included: false,
                served: true,
                nocache: true,
            },
            './tests/device/**/*.test.js',
        ],

        webpackMiddleware: {
            stats: 'errors-only',
        },
        webpack: {
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        exclude: /node_modules/,
                        use: ['babel-loader'],
                    },
                ],
            },
            plugins: [
                // provide fallback plugins, Buffer and process are used in fixtures
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer'],
                    process: 'process/browser',
                }),
                // replace TrezorConnect module used in ./tests/common.setup.js
                new webpack.NormalModuleReplacementPlugin(
                    /src\/js\/index$/,
                    '../build/trezor-connect',
                ),
                // replace ws module used in ./tests/websocket-client.js
                new webpack.NormalModuleReplacementPlugin(
                    /ws$/,
                    '@trezor/blockchain-link/lib/utils/ws',
                ),

                new webpack.DefinePlugin({
                    // set custom connect endpoint to build directory
                    'process.env.TREZOR_CONNECT_SRC': JSON.stringify(
                        'http://localhost:8099/base/build/',
                    ),
                    // pass required process.env variables
                    'process.env.TESTS_FIRMWARE': JSON.stringify(process.env.TESTS_FIRMWARE),
                    'process.env.TESTS_INCLUDED_METHODS': JSON.stringify(
                        process.env.TESTS_INCLUDED_METHODS,
                    ),
                    'process.env.TESTS_TESTS_EXCLUDED_METHODS': JSON.stringify(
                        process.env.TESTS_EXCLUDED_METHODS,
                    ),
                    'process.env.TESTS_USE_TX_CACHE': JSON.stringify(
                        process.env.TESTS_USE_TX_CACHE,
                    ),
                    'process.env.TESTS_USE_WS_CACHE': JSON.stringify(
                        process.env.TESTS_USE_WS_CACHE,
                    ),
                }),
            ],
        },

        reporters: ['progress', 'coverage', 'TrezorConnect'], // use custom reporter from karma.plugin
        coverageReporter: {
            dir: 'coverage',
            reporters: [
                {
                    type: 'html',
                    subdir: 'report-html',
                },
            ],
            instrumenterOptions: {
                istanbul: {
                    noCompact: true,
                },
            },
        },
    });
};
