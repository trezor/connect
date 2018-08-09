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
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

module.exports = {
    mode: 'production',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`
    },
    output: {
        filename: '[name].js',
        path: DIST,
        publicPath: './',
        library: LIB_NAME,
        libraryTarget: 'umd',
        libraryExport: 'default'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    resolve: {
        modules: [ SRC, NODE_MODULES ],
    },
    performance: {
        hints: false
    },
    plugins: [],

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
    //                 }
    //             }
    //         })
    //     ]
    // },
    optimization: {
        minimize: false
    },



    // ignoring Node.js import in fastxpub (hd-wallet)
    node: {
        fs: "empty",
        path: "empty",
    }
}
