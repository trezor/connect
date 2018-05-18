import { LIB_NAME, SRC, JS_SRC, DIST, NODE_MODULES } from './constants';
import webpack from 'webpack';

import WebpackPreBuildPlugin from 'pre-build-webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import { default as compileInlineCss } from './stylesheet';

module.exports = {
    entry: {
        'trezor-connect': `${JS_SRC}entrypoints/connect.js`,
    },
    output: {
        filename: 'index.js',
        path: DIST,
        publicPath: './',
        library: LIB_NAME,
        libraryTarget: 'umd',
    },

    module: {
        rules: [
            {
                test: /(\.jsx|\.js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
        ]
    },
    resolve: {
        modules: [SRC, NODE_MODULES]
    },

    plugins: [
        new WebpackPreBuildPlugin(() => {
            compileInlineCss();
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
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            PRODUCTION: JSON.stringify(true)
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
