import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import {
    SRC,
    HTML_SRC,
    DATA_SRC,
    JS_SRC,
    DIST,
    LIB_NAME,
    CONNECT_COMMON_DATA_SRC,
} from './constants';

module.exports = {
    target: 'web',
    mode: 'production',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
        iframe: `${JS_SRC}iframe/iframe.js`,
        popup: `${JS_SRC}popup/popup.js`,
        webusb: `${JS_SRC}webusb/index.js`,
        extensionPermissions: `${JS_SRC}webusb/extensionPermissions.js`,
    },
    output: {
        filename: 'js/[name].[contenthash].js',
        path: DIST,
        publicPath: './',
        library: LIB_NAME,
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath: '../' },
                    },
                    'css-loader',
                    'less-loader',
                ],
            },
            {
                test: /\.(png|gif|jpg)$/,
                type: 'asset/resource',
                generator: {
                    filename: './images/[name][contenthash][ext]',
                },
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                type: 'asset/resource',
                generator: {
                    filename: './fonts/[name][contenthash][ext]',
                },
            },
            {
                test: /sharedConnectionWorker/i,
                loader: 'worker-loader',
                options: {
                    worker: 'SharedWorker',
                    filename: './workers/shared-connection-worker.[contenthash].js',
                },
            },
            {
                test: /\workers\/blockbook\/index/i,
                loader: 'worker-loader',
                options: {
                    filename: './workers/blockbook-worker.[contenthash].js',
                },
            },
            {
                test: /\workers\/ripple\/index/i,
                loader: 'worker-loader',
                options: {
                    filename: './workers/ripple-worker.[contenthash].js',
                },
            },
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
        mainFields: ['browser', 'module', 'main'],
        fallback: {
            fs: false, // ignore "fs" import in fastxpub (hd-wallet)
            path: false, // ignore "path" import in protobufjs-old-fixed-webpack (dependency of trezor-link)
            net: false, // ignore "net" import in "ripple-lib"
            tls: false, // ignore "tls" imports in "ripple-lib"
            vm: false, // ignore "vm" imports in "asn1.js@4.10.1" > crypto-browserify"
            util: require.resolve('util'), // required by "ripple-lib"
            assert: require.resolve('assert'), // required by multiple dependencies
            crypto: require.resolve('crypto-browserify'), // required by multiple dependencies
            stream: require.resolve('stream-browserify'), // required by utxo-lib and keccak
        },
    },
    performance: {
        hints: false,
    },
    plugins: [
        // provide fallback for global objects.
        // resolve.fallback will not work since those objects are not imported as modules.
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer'],
            Promise: ['es6-promise', 'Promise'],
            process: 'process/browser',
        }),

        // resolve trezor-connect modules as "browser"
        new webpack.NormalModuleReplacementPlugin(/env\/node$/, './env/browser'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/workers$/, '../env/browser/workers'),
        new webpack.NormalModuleReplacementPlugin(
            /env\/node\/networkUtils$/,
            '../env/browser/networkUtils',
        ),

        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css',
            chunkFilename: '[id].css',
        }),

        new HtmlWebpackPlugin({
            chunks: ['iframe'],
            filename: 'iframe.html',
            template: `${HTML_SRC}iframe.html`,
            inject: false,
        }),
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            filename: 'popup.html',
            template: `${HTML_SRC}popup.html`,
            inject: false,
        }),
        new HtmlWebpackPlugin({
            chunks: ['webusb'],
            filename: 'webusb.html',
            template: `${HTML_SRC}webusb.html`,
            inject: true,
        }),
        new HtmlWebpackPlugin({
            chunks: ['extensionPermissions'],
            filename: 'extension-permissions.html',
            template: `${HTML_SRC}extension-permissions.html`,
            inject: true,
        }),

        new CopyWebpackPlugin({
            patterns: [
                { from: `${HTML_SRC}index.html`, to: `${DIST}index.html` },
                { from: DATA_SRC, to: `${DIST}data` },
                { from: CONNECT_COMMON_DATA_SRC, to: `${DIST}data` },
            ],
        }),
    ],

    // @trezor/utxo-lib NOTE:
    // When uglifying the javascript, you must exclude the following variable names from being mangled:
    // Array, BigInteger, Boolean, Buffer, ECPair, Function, Number, Point and Script.
    // This is because of the function-name-duck-typing used in typeforce.
    optimization: {
        emitOnErrors: true,
        moduleIds: 'named',
        // minimize: false,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                extractComments: false,
                terserOptions: {
                    ecma: 6,
                    mangle: {
                        reserved: [
                            'Array',
                            'BigInteger',
                            'Boolean',
                            'Buffer',
                            'ECPair',
                            'Function',
                            'Number',
                            'Point',
                            'Script',
                        ],
                    },
                },
            }),
        ],
    },
};
