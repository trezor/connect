import { SRC, JS_SRC, NODE_MODULES } from './constants';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

module.exports = {
    cache: true,
    mode: 'development',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: { publicPath: '../' }
                    },
                    'css-loader',
                    'less-loader',
                ]
            },
            {
                test: /\.(png|gif|jpg)$/,
                loader: 'file-loader?name=./images/[name].[ext]',
                query: {
                    outputPath: './images',
                    name: '[name].[ext]',
                }
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                loader: 'file-loader',
                query: {
                    outputPath: './fonts',
                    name: '[name].[ext]',
                },
            },
            {
                test: /\.wasm$/,
                loader: 'file-loader',
                query: {
                    name: 'js/[name].[hash].[ext]',
                },
            },
            {
                type: 'javascript/auto',
                test: /\.json/,
                exclude: /node_modules/,
                loader: 'file-loader',
                query: {
                    outputPath: './data',
                    name: '[name].[ext]',
                },
            },
        ]
    },

    resolve: {
        modules: [ JS_SRC, './node_modules' ],
        alias: {

        }
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        // ignore Node.js lib from trezor-link
        new webpack.IgnorePlugin(/\/iconv-loader$/),
    ],

    node: {
        fs: "empty"
    }
}
