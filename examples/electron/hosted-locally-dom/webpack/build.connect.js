const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const DIST = path.resolve(__dirname, '../build/trezor-connect');

module.exports = {
    mode: 'production',
    entry: {
        iframe: './node_modules/trezor-connect/lib/iframe/iframe.js',
    },
    output: {
        filename: 'js/[name].[hash].js',
        path: DIST,
        publicPath: './',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
    resolve: {
        modules: ['node_modules'],
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/.blake2b$/, './blake2b.js'),
        new webpack.NormalModuleReplacementPlugin(/env\/node$/, './env/browser'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/workers$/, '../env/browser/workers'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/networkUtils$/, '../env/browser/networkUtils'),
        new HtmlWebpackPlugin({
            chunks: ['iframe'],
            filename: 'iframe.html',
            template: './webpack/iframe.html',
            inject: false,
        }),
        new CopyWebpackPlugin([
            { from: './node_modules/trezor-connect/data', to: `${DIST}/data` },
        ]),

        // ignore Node.js lib from trezor-link
        new webpack.IgnorePlugin(/\/iconv-loader$/),
        new webpack.IgnorePlugin(/\/shared-connection-worker$/),
    ],

    // @trezor/utxo-lib NOTE:
    // When uglifying the javascript, you must exclude the following variable names from being mangled:
    // Array, BigInteger, Boolean, Buffer, ECPair, Function, Number, Point and Script.
    // This is because of the function-name-duck-typing used in typeforce.
    optimization: {
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    ecma: 6,
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
