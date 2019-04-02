import {
    SRC,
    HTML_SRC,
    DATA_SRC,
    JS_SRC,
    DIST,
    LIB_NAME,
    NODE_MODULES,
} from './constants';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

module.exports = {
    mode: 'production',
    entry: {
        'trezor-connect': ['@babel/polyfill', `${JS_SRC}index.js`],
        'iframe': `${JS_SRC}iframe/iframe.js`,
        'popup': `${JS_SRC}popup/popup.js`,
        'webusb': `${JS_SRC}webusb/index.js`,
        'extensionPermissions': `${JS_SRC}webusb/extensionPermissions.js`,
    },
    output: {
        filename: 'js/[name].[hash].js',
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
                exclude: [/node_modules/, /trezor-blockchain-link\/build\/workers/],
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
                loader: 'file-loader?name=./images/[name].[ext]',
                query: {
                    outputPath: './images',
                    name: '[name].[hash].[ext]',
                },
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                loader: 'file-loader',
                query: {
                    outputPath: './fonts',
                    name: '[name].[hash].[ext]',
                },
            },
            {
                type: 'javascript/auto',
                test: /\.wasm$/,
                loader: 'file-loader',
                query: {
                    name: 'js/[name].[hash].[ext]',
                },
            },
            {
                type: 'javascript/auto',
                test: /\.json/,
                exclude: /node_modules/,
                loader: 'file-loader',
                query: {
                    outputPath: './data',
                    name: '[name].[hash].[ext]',
                },
            },
        ],
    },
    resolve: {
        modules: [ SRC, NODE_MODULES ],
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/.blake2b$/, './blake2b.js'),

        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash].css',
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

        new CopyWebpackPlugin([
            { from: `${HTML_SRC}index.html`, to: `${DIST}index.html` },
            { from: `${HTML_SRC}webusb.html`, to: `${DIST}webusb.html` },
            { from: DATA_SRC, to: `${DIST}data` },
        ]),

        // ignore Node.js lib from trezor-link
        new webpack.IgnorePlugin(/\/iconv-loader$/),
    ],

    // bitcoinjs-lib NOTE:
    // When uglifying the javascript, you must exclude the following variable names from being mangled:
    // Array, BigInteger, Boolean, ECPair, Function, Number, Point and Script.
    // This is because of the function-name-duck-typing used in typeforce.
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                parallel: true,
                uglifyOptions: {
                    compress: {
                        warnings: false,
                    },
                    mangle: {
                        reserved: [
                            'Array', 'BigInteger', 'Boolean', 'Buffer',
                            'ECPair', 'Function', 'Number', 'Point', 'Script',
                        ],
                    },
                },
            }),
        ],
    },

    // ignoring Node.js import in fastxpub (hd-wallet)
    node: {
        fs: 'empty',
        path: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};
