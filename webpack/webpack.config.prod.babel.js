import { LIB_NAME, SRC, JS_SRC, HTML_SRC, DATA_SRC, STYLE_SRC, DIST, NODE_MODULES } from './constants';
import webpack from 'webpack';

import WebpackPreBuildPlugin from 'pre-build-webpack';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

import downloadDependencies from './data.dependencies';
import { default as compileInlineCss } from './stylesheet';

const extractLess = new ExtractTextPlugin({
    filename: 'css/[name].[contenthash].css'
});

module.exports = {
    entry: {
        'trezor-connect': `${JS_SRC}entrypoints/connect.js`,
        'iframe': `${JS_SRC}iframe/iframe.js`,
        'popup': `${JS_SRC}popup/popup.js`
    },
    output: {
        filename: 'js/[name].[hash].js',
        path: DIST,
        publicPath: './',
        library: LIB_NAME,
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.(png|gif|jpg|ttf|eot|svg|woff|woff2)$/,
                loader: 'file-loader',
                query: {
                    name: '[name].[hash].[ext]',
                },
            },
            {
                test: /\.less$/,
                include: STYLE_SRC,
                loader: extractLess.extract({
                    use: [
                        { loader: 'css-loader' },
                        { loader: 'less-loader' }
                    ],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.wasm$/,
                loader: 'file-loader',
                query: {
                    name: 'js/[name].[hash].[ext]',
                },
            },
        ]
    },
    resolve: {
        modules: [SRC, NODE_MODULES]
    },
    plugins: [

        new WebpackPreBuildPlugin(() => {
            downloadDependencies();
            compileInlineCss();
        }),

        extractLess,
        new webpack.IgnorePlugin(/\/iconv-loader$/),
        new HtmlWebpackPlugin({
            chunks: ['trezor-connect'],
            filename: 'index.html',
            template: `${HTML_SRC}index.html`,
            inject: true
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

        new CopyWebpackPlugin([
            { from: `${DATA_SRC}config.json`, to: `${DIST}data/config.json` },
            { from: `${DATA_SRC}coins.json`, to: `${DIST}data/coins.json` },
            { from: `${DATA_SRC}config_signed.bin`, to: `${DIST}data/config_signed.bin` },
            { from: `${DATA_SRC}latest.txt`, to: `${DIST}data/latest.txt` },
            { from: `${DATA_SRC}releases-1.json`, to: `${DIST}data/releases-1.json` },
            { from: `${DATA_SRC}releases-2.json`, to: `${DIST}data/releases-2.json` },
        ]),

        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('umd-lib'),
            PRODUCTION: JSON.stringify(true)
        }),

        //bitcoinjs-lib: NOTE: When uglifying the javascript, you must exclude the following variable names from being mangled: Array, BigInteger, Boolean, ECPair, Function, Number, Point and Script. This is because of the function-name-duck-typing used in typeforce.
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false,
                },
                ie8: false,
                mangle: {
                    reserved: [
                        'Array', 'BigInteger', 'Boolean', 'Buffer',
                        'ECPair', 'Function', 'Number', 'Point', 'Script',
                    ],
                },
            }
        }),

        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        })
    ],

    // ignoring "fs" import in fastxpub
    node: {
        fs: "empty",
        path: "empty",
    }
}
