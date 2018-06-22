import {
    SRC,
    HTML_SRC,
    DATA_SRC,
    JS_SRC,
    DIST,
    LIB_NAME,
    NODE_MODULES,
    PORT
} from './constants';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

module.exports = {
    watch: true,
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        'trezor-connect': `${JS_SRC}entrypoints/connect.js`,
        'iframe': ['babel-polyfill', `${JS_SRC}iframe/iframe.js`], // babel-polyfill is not compiled into trezor-link
        'popup': `${JS_SRC}popup/popup.js`,
        'webusb': `${JS_SRC}entrypoints/webusb.js`
    },
    output: {
        filename: '[name].js',
        path: '/',
        publicPath: '/',
        library: LIB_NAME,
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    devServer: {
        contentBase: SRC,
        hot: false,
        https: true,
        port: PORT,
        // stats: 'minimal',
        inline: true,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath: '../' }
                    },
                    'css-loader',
                    'less-loader',
                ]
            },
            {
                test: /\.(png|gif|jpg)$/,
                loader: 'file-loader?name=./images/[name].[ext]',
                query: {
                    outputPath: './images',
                    name: '[name].[ext]',
                }
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                loader: 'file-loader',
                query: {
                    outputPath: './fonts',
                    name: '[name].[ext]',
                },
            },
            {
                type: 'javascript/auto',
                test: /\.wasm$/,
                loader: 'file-loader',
                query: {
                    name: 'js/[name].[ext]',
                },
            },
            {
                type: 'javascript/auto',
                test: /\.json/,
                exclude: /node_modules/,
                loader: 'file-loader',
                query: {
                    outputPath: './data',
                    name: '[name].[ext]',
                },
            },
        ]
    },
    resolve: {
        modules: [ SRC, NODE_MODULES ],
        alias: {
            'flowtype/trezor': `${SRC}flowtype/empty.js`,
        }
    },
    performance: {
        hints: false
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),

        new HtmlWebpackPlugin({
            chunks: ['iframe'],
            filename: `iframe.html`,
            template: `${HTML_SRC}iframe.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            filename: 'popup.html',
            template: `${HTML_SRC}popup.html`,
            inject: true
        }),
        new HtmlWebpackPlugin({
            chunks: ['webusb'],
            filename: `webusb.html`,
            template: `${HTML_SRC}webusb.html`,
            inject: true
        }),

        new CopyWebpackPlugin([
            { from: `${DATA_SRC}config.json`, to: `data/config.json` },
            { from: `${DATA_SRC}coins.json`, to: `data/coins.json` },
            { from: `${DATA_SRC}config_signed.bin`, to: `data/config_signed.bin` },
            { from: `${DATA_SRC}messages.json`, to: `data/messages.json` },
            { from: `${DATA_SRC}latest.txt`, to: `data/latest.txt` },
            { from: `${DATA_SRC}releases-1.json`, to: `data/releases-1.json` },
            { from: `${DATA_SRC}releases-2.json`, to: `data/releases-2.json` },
            { from: `${SRC}images`, to: 'images' },
        ]),

        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),

        // ignore Node.js lib from trezor-link
        new webpack.IgnorePlugin(/\/iconv-loader$/),
    ],

    // ignoring Node.js import in fastxpub (hd-wallet)
    node: {
        fs: "empty"
    }
}
