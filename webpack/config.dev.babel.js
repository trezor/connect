import {
    SRC,
    HTML_SRC,
    JS_SRC,
    LIB_NAME,
    PORT,
} from './constants';

import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

module.exports = {
    watch: true,
    mode: 'development',
    devtool: 'inline-source-map',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
        'iframe': `${JS_SRC}iframe/iframe.js`,
        'popup': `${JS_SRC}popup/popup.js`,
        'webusb': `${JS_SRC}webusb/index.js`,
        'extensionPermissions': `${JS_SRC}webusb/extensionPermissions.js`,
    },
    output: {
        filename: '[name].js',
        path: '/',
        publicPath: '/',
        library: LIB_NAME,
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    devServer: {
        contentBase: SRC,
        hot: false,
        https: false,
        port: PORT,
        // stats: 'minimal',
        inline: true,
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
                loader: 'file-loader?name=./images/[name].[ext]',
                query: {
                    outputPath: './images',
                    name: '[name].[ext]',
                },
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
                test: /\.json/,
                exclude: /node_modules/,
                loader: 'file-loader',
                query: {
                    outputPath: './data',
                    name: '[name].[ext]',
                },
            },
        ],
    },
    resolve: {
        modules: [ SRC, 'node_modules' ],
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/.blake2b$/, './blake2b.js'),
        new webpack.NormalModuleReplacementPlugin(/env\/node$/, './env/browser'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/workers$/, '../env/browser/workers'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/networkUtils$/, '../env/browser/networkUtils'),

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

        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),

        // ignore Node.js lib from trezor-link
        new webpack.IgnorePlugin(/\/iconv-loader$/),
    ],

    // ignore "fs" import in fastxpub (hd-wallet)
    // ignore "net" and "tls" imports in "ripple-lib"
    node: {
        fs: 'empty',
        path: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};
