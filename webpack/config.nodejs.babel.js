import {
    SRC,
    JS_SRC,
    DATA_SRC,
    DIST,
    LIB_NAME,
    NODE_MODULES,
} from './constants';

import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
// import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

module.exports = {
    mode: 'production',
    target: 'node',
    node: {
        __dirname: false,
        __filename: false,
        // ws deps
        'bufferutil': 'empty',
        'utf-8-validate': 'empty',
    },
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
    },
    output: {
        filename: 'js/[name].js',
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
                exclude: [/node_modules/],
                use: ['babel-loader'],
            },
            {
                type: 'javascript/auto',
                test: /\.wasm$/,
                loader: 'file-loader',
                query: {
                    name: 'js/[name].[ext]',
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
        new webpack.NormalModuleReplacementPlugin(/env\/browser$/, './env/node'),
        new webpack.NormalModuleReplacementPlugin(/env\/browser\/workers$/, '../env/node/workers'),
        new webpack.NormalModuleReplacementPlugin(/utils\/networkUtils$/, '../env/node/networkUtils'),
        new webpack.NormalModuleReplacementPlugin(/whatwg-fetch$/, 'node-fetch'),
        // https://github.com/socketio/engine.io-client/issues/609
        new webpack.NormalModuleReplacementPlugin(
            /engine.io-client\/lib\/transports\/websocket\.js/,
            `${__dirname}/js/engine.io-websocket.js`
        ),

        new CopyWebpackPlugin([
            { from: DATA_SRC, to: `${DIST}data` },
            { from: `${NODE_MODULES}tiny-worker/lib/worker.js`, to: `${DIST}js/worker.js` },
            { from: `${NODE_MODULES}tiny-worker/lib/noop.js`, to: `${DIST}js/noop.js` },
        ]),

        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),
    ],

    // bitcoinjs-lib NOTE:
    // When uglifying the javascript, you must exclude the following variable names from being mangled:
    // Array, BigInteger, Boolean, ECPair, Function, Number, Point and Script.
    // This is because of the function-name-duck-typing used in typeforce.
    // optimization: {
    //     minimizer: [
    //         new UglifyJsPlugin({
    //             parallel: true,
    //             uglifyOptions: {
    //                 compress: {
    //                     warnings: false,
    //                 },
    //                 mangle: {
    //                     reserved: [
    //                         'Array', 'BigInteger', 'Boolean', 'Buffer',
    //                         'ECPair', 'Function', 'Number', 'Point', 'Script',
    //                     ],
    //                 },
    //             },
    //         }),
    //     ],
    // },
    optimization: {
        minimize: false,
    },
};
