import {
    SRC,
    JS_SRC,
    NODE_MODULES,
} from './constants';

import path from 'path';
import webpack from 'webpack';

module.exports = {
    mode: 'production',
    target: 'node',
    entry: {
        'trezor-connect': `./npm-node/lib/node/index.js`,
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../npm-node/bundle'),
        publicPath: './',
        library: 'TrezorConnect',
        libraryTarget: 'umd',
        libraryExport: 'default',
    },
    externals: {
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: [/node_modules/],
                use: ['babel-loader'],
            },
            {
                type: 'javascript/auto',
                test: /\.wasm$/,
                loader: 'file-loader',
                query: {
                    name: 'workers/[name].[ext]',
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
    optimization: {
        minimize: false,
    },
    plugins: [
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
    ],
};
