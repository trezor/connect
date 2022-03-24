import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import {
    ABSOLUTE_BASE,
    DATA_SRC,
    CONNECT_COMMON_DATA_SRC,
    HTML_SRC,
    JS_SRC,
    LIB_NAME,
    PORT,
    SRC,
    MESSAGES_SRC,
} from './constants';

module.exports = {
    target: 'web',
    mode: 'development',
    stats: {
        children: true,
    },
    devtool: 'inline-source-map',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
        iframe: `${JS_SRC}iframe/iframe.js`,
        popup: `${JS_SRC}popup/popup.js`,
        webusb: `${JS_SRC}webusb/index.js`,
        extensionPermissions: `${JS_SRC}webusb/extensionPermissions.js`,
    },
    output: {
        publicPath: '/',
        library: LIB_NAME,
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    devServer: {
        hot: false,
        https: {
            // https://webpack.js.org/configuration/dev-server/#devserverhttps
            key: `${ABSOLUTE_BASE}/webpack/connect_dev.key`,
            cert: `${ABSOLUTE_BASE}/webpack/connect_dev.crt`,
        },
        port: PORT,
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
                    filename: './images/[name][ext]',
                },
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                type: 'asset/resource',
                generator: {
                    filename: './fonts/[name][ext]',
                },
            },
            {
                test: /sharedConnectionWorker/i,
                loader: 'worker-loader',
                issuer: /browser\/workers/i, // replace import ONLY in src/env/browser/workers
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
            {
                test: /\workers\/blockfrost\/index/i,
                loader: 'worker-loader',
                options: {
                    filename: './workers/blockfrost-worker.[contenthash].js',
                },
            },
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
        mainFields: ['browser', 'module', 'main'],
        fallback: {
            fs: false, // ignore "fs" import in fastxpub (hd-wallet)
            https: false, // ignore "https" import in "ripple-lib"
            vm: false, // ignore "vm" imports in "asn1.js@4.10.1" > crypto-browserify"
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
            filename: '[name].css',
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
                { from: DATA_SRC, to: 'data' },
                { from: CONNECT_COMMON_DATA_SRC, to: 'data' },
                { from: MESSAGES_SRC, to: `data/messages`, force: true },
            ],
        }),
    ],

    optimization: {
        emitOnErrors: true,
        moduleIds: 'named',
    },
};
