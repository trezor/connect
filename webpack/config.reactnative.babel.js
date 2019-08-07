import {
    SRC,
    JS_SRC,
    DIST,
    LIB_NAME,
} from './constants';

import webpack from 'webpack';
// import TerserPlugin from 'terser-webpack-plugin';

module.exports = {
    mode: 'production',
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
    externals: {
        'react-native-threads': 'commonjs react-native-threads',
        'whatwg-fetch': 'commonjs whatwg-fetch',
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
        modules: [ SRC, 'node_modules' ],
    },
    resolveLoader: {
        modules: [ 'node_modules' ],
        alias: {
            'react-native-worker': `${__dirname}/js/react-native-worker.js`,
        },
    },
    performance: {
        hints: false,
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(/.blake2b$/, './blake2b.js'),
        new webpack.NormalModuleReplacementPlugin(/env\/browser$/, './env/react-native'),
        new webpack.NormalModuleReplacementPlugin(/env\/browser\/workers$/, '../env/react-native/workers'),
        new webpack.NormalModuleReplacementPlugin(/env\/node\/networkUtils$/, '../env/react-native/networkUtils'),

        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.NamedModulesPlugin(),

        // ignore Node.js lib from trezor-link
        new webpack.IgnorePlugin(/\/iconv-loader$/),
    ],

    // @trezor/utxo-lib NOTE:
    // When uglifying the javascript, you must exclude the following variable names from being mangled:
    // Array, BigInteger, Boolean, Buffer, ECPair, Function, Number, Point and Script.
    // This is because of the function-name-duck-typing used in typeforce.
    // optimization: {
    //     minimizer: [
    //         new TerserPlugin({
    //             parallel: true,
    //             terserOptions: {
    //                 ecma: 6,
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

    // ignoring Node.js import in fastxpub (hd-wallet)
    node: {
        __dirname: false,
        fs: 'empty',
        path: 'empty',
        net: 'empty',
        tls: 'empty',
    },
};
