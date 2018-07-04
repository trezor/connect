import {
    SRC,
    JS_SRC,
    DIST,
    LIB_NAME,
    NODE_MODULES,
} from './constants';

import webpack from 'webpack';
import WebpackPreBuildPlugin from 'pre-build-webpack';
import { default as compileInlineCss } from './stylesheet';

module.exports = {
    mode: 'production',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
    },
    output: {
        filename: 'index.min.js',
        path: DIST,
        publicPath: './',
        library: LIB_NAME,
        libraryTarget: 'umd',
        // libraryExport: 'default'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
        ]
    },
    resolve: {
        modules: [ SRC, NODE_MODULES ],
    },
    performance: {
        hints: false
    },
    plugins: [
        new WebpackPreBuildPlugin(() => {
            compileInlineCss();
        }),

        new webpack.optimize.OccurrenceOrderPlugin()
    ],

    // optimization: {
    //     minimize: false
    // }
}
