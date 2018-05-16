import { SRC, HTML_SRC, JS_SRC, DIST, LIB_NAME, NODE_MODULES } from './constants';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
const extractLess = new ExtractTextPlugin({
    filename: './[name].css'
});

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        'popup': `${JS_SRC}popup/popup.js`,
    },
    output: {
        filename: '[name].js',
        path: '/',
        publicPath: '/',
        //library: LIB_NAME,
        //libraryTarget: 'umd',
        //umdNamedDefine: true
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                //use: ['babel-loader', 'webpack-module-hot-accept']
                use: ['babel-loader']
            },
            {
                test: /\.(png|gif|jpg)$/,
                loader: 'file-loader?name=./images/[name].[ext]'
            },
            {
                test: /\.less$/,
                exclude: /node_modules/,
                loader: extractLess.extract({
                    use: [
                        { loader: 'css-loader' },
                        { loader: 'less-loader' }
                    ],
                    fallback: 'style-loader'
                })
            },
            {
                test: /\.(ttf|eot|svg|woff|woff2)$/,
                loader: 'file-loader',
                query: {
                    name: './fonts/[name].[hash].[ext]',
                },
            },
        ]
    },
    resolve: {
        modules: [ SRC, NODE_MODULES ],
        alias: {
            'flowtype/trezor': `${SRC}flowtype/index.js`,
        }
    },
    performance: {
        hints: false
    },
    plugins: [
        extractLess,
        new webpack.IgnorePlugin(/\/iconv-loader$/),
        new HtmlWebpackPlugin({
            chunks: ['popup'],
            filename: 'index.html',
            template: `${HTML_SRC}popup.html`,
            inject: true
        }),
        new CopyWebpackPlugin([
            { from: 'src/data/config.json', to: 'data/config.json' },
        ]),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            PRODUCTION: JSON.stringify(false)
        })
    ],
    node: {
        fs: "empty"
    }
}
