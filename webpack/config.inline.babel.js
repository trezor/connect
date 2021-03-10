import webpack from 'webpack';
import { SRC, JS_SRC, DIST, LIB_NAME } from './constants';

// Generate inline script hosted on https://connect.trezor.io/X/trezor-connect.js
// This is compiled and polyfilled npm package without Core logic

module.exports = {
    target: 'web',
    mode: 'production',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
    },
    output: {
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
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
    },
    performance: {
        hints: false,
    },
    plugins: [
        // polyfills
        new webpack.ProvidePlugin({
            Promise: ['es6-promise', 'Promise'],
        }),
        // resolve trezor-connect modules as "browser"
        new webpack.NormalModuleReplacementPlugin(/env\/node$/, './env/browser'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/workers$/, '../env/browser/workers'),
        new webpack.NormalModuleReplacementPlugin(
            /env\/node\/networkUtils$/,
            '../env/browser/networkUtils',
        ),
    ],

    optimization: {
        emitOnErrors: true,
        moduleIds: 'named',
        minimize: false,
    },
};
