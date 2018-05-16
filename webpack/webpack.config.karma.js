// import { JS_SRC, HTML_SRC } from './constants';
// import webpack from 'webpack';
// import webpackMerge from 'webpack-merge';
// import baseConfig from './webpack.config.dev';

// import HtmlWebpackPlugin from 'html-webpack-plugin';
// import ExtractTextPlugin from 'extract-text-webpack-plugin';
// const extractLess = new ExtractTextPlugin({
//     filename: './[name].css'
// });

var webpack = require('webpack');
var constants = require('./constants');

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        'trezorjs-npm': `${constants.JS_SRC}index-npm.js`,
    },
    output: {
        filename: '[name].js',
        path: '/',
        publicPath: '/',
        library: constants.LIB_NAME,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                        plugins: [
                            "transform-class-properties",
                            "transform-object-rest-spread",
                            "transform-flow-strip-types",
                            ["transform-runtime", {
                              "polyfill": false,
                              "regenerator": true
                            }]
                        ]
                    }
                }
            }
        ]
    },
    resolve: {
        modules: [ constants.SRC, constants.NODE_MODULES ],
        alias: {
            'flowtype/trezor': `${constants.SRC}flowtype/index.js`,
        }
    },
    performance: {
        hints: false
    },
    plugins: [

    ]
}
