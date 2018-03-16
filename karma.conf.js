// https://raw.githubusercontent.com/zyml/es6-karma-jasmine-webpack-boilerplate/master/karma.config.js

var path = require('path');
var HtmlWebpackPlugin =  require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractLess = new ExtractTextPlugin({
    filename: './[name].css'
});

module.exports = function(config) {
    config.set({

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
            //'./src/js/entrypoints/connect.js': ['webpack'],
            // './src/js/iframe/iframe.js': ['webpack'],
            // './src/js/popup/popup.js': ['webpack'],
            './src/__tests__/*.test.js': ['webpack'],
            //'./src/__tests__/*.test.js': ['webpack'],
            // './src/__tests__/*.test.js': ['babel'],
            // './src/__tests__/**/*.test.js': ['babel'],
            //'src/js/*.js': ['webpack', 'sourcemap'],
            //'src/js/*.js': ['webpack', 'sourcemap'],
            // './src/js/iframe/iframe.js': ['webpack', 'sourcemap'],
        },

        babelPreprocessor: {
            options: {
                presets: ['env'],
                sourceMap: 'inline'
            },
            filename: function (file) {
                return file.originalPath.replace(/\.js$/, '.es5.js');
            },
            sourceFileName: function (file) {
                return file.originalPath;
            }
        },

        files: [
            //'src/js/trezorjs-npm.js',
            //'src/js/index-npm.js',
            'src/__tests__/*.test.js',
            //{ pattern: 'src/js/index-npm.js', included: true, served: true, nocache: true },
            //'src/js/entrypoints/connect.js',

            // { pattern: './src/__tests__/iframe.js', included: false, served: true },
            { pattern: './src/js/iframe/iframe.js', included: false, served: true },
            { pattern: './src/js/popup/popup.js', included: false, served: true },
            { pattern: './src/data/coins.json', included: false, served: true, nocache: true },
            { pattern: './src/data/latest.txt', included: false, served: true, nocache: true },
            { pattern: './src/__tests__/iframe.html', included: false, served: true },
            { pattern: './src/__tests__/popup.html', included: false, served: true },
        ],

        proxies: {
            "/iframe.js": "http://localhost:8099/base/src/js/iframe/iframe.js",
            "/iframe.html": "http://localhost:8099/base/src/__tests__/iframe.html",
            "/popup.js": "http://localhost:8099/base/src/js/popup/popup.js",
            "/popup.html": "http://localhost:8099/base/src/__tests__/popup.html",
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
        logLevel: config.LOG_DEBUG,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        //browsers: ['chrome_without_security'],
        browsers: ['ChromeCanary'],
        //browsers: ['Chrome'],
        //browsers: ['Firefox'],

        customLaunchers: {
            chrome_without_security: {
                base: 'Chrome',
                flags: [
                    '--load-extension=/Users/szymon.lesisz/Library/Application Support/Google/Chrome/Default/Extensions/jcjjhjgimijdkoamemaghajlhegmoclj'
                ],
                displayName: 'Chrome w/o security'
            }
        },

        client: {
            captureConsole: true,
            clearContext: true,
            useIframe: false,
            runInParent: true
        },

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity,

        hostname: 'test.localhost',
        port: 8099,

        webpack: {
            cache: true,
            devtool: 'inline-source-map',
            entry: {
                'src/js/entrypoints/connect.js': './src/js/entrypoints/connect.js',
                'src/js/iframe/iframe.js': ['babel-polyfill', './src/js/iframe/iframe.js'],
            },
            // output: {
            //     filename: 'js/[name].js',
            //     path: './src/__tests__/'
            // },
            module: {
                loaders: [
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /(node_modules)/,
                        use: {
                            loader: 'babel-loader',
                            options: {

                            }
                        }
                    },
                    {
                        test: /\.less$/,
                        exclude: /node_modules/,
                        loader: extractLess.extract({
                            use: [
                                { loader: 'css-loader' },
                                { loader: 'less-loader' }
                            ],
                            fallback: 'style-loader'
                        })
                    },
                    {
                        test: /\.(ttf|eot|svg|woff|woff2)$/,
                        loader: 'file-loader',
                        query: {
                            name: './fonts/[name].[hash].[ext]',
                        },
                    },
                ]
            },
            plugins: [
                extractLess,
            ]
        },

        // webpackServer: {
        //     noInfo: false //please don’t spam the console when running in karma!
        // },

        // httpsServerOptions: {
        //     key: fs.readFileSync('server.key', 'utf8'),
        //     cert: fs.readFileSync('server.crt', 'utf8')
        // },




    })
}
