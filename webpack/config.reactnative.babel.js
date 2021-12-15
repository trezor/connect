import webpack from 'webpack';
import { SRC, JS_SRC, DIST, LIB_NAME } from './constants';

// not used (?)
// related to POC with running connect as a nodejs process in react-native-thread

module.exports = {
    mode: 'production',
    stats: {
        children: true,
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
    externals: {
        'react-native': 'commonjs react-native',
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
        modules: [SRC, 'node_modules'],
        fallback: {
            fs: false, // ignore "fs" import in fastxpub (hd-wallet)
            path: false,
            net: false, // ignore "net" and "tls" imports in "ripple-lib"
            tls: false,
            http: false, // ignore "http" imports in "ripple-lib"
            https: false, // ignore "http" imports in "ripple-lib"
            crypto: false, // no polyfill
            stream: require.resolve('stream-browserify'), // polyfill
        },
    },
    resolveLoader: {
        modules: ['node_modules'],
        alias: {
            'react-native-worker': `${__dirname}/js/react-native-worker.js`,
        },
    },
    performance: {
        hints: false,
    },
    plugins: [
        // resolve trezor-connect modules as "react-native"
        new webpack.NormalModuleReplacementPlugin(/env\/node$/, './env/react-native'),
        new webpack.NormalModuleReplacementPlugin(
            /env\/node\/workers$/,
            '../env/react-native/workers',
        ),
        new webpack.NormalModuleReplacementPlugin(
            /env\/node\/networkUtils$/,
            '../env/react-native/networkUtils',
        ),

        new webpack.IgnorePlugin(/\/shared-connection-worker$/),
    ],

    optimization: {
        emitOnErrors: true,
        moduleIds: 'named',
        minimize: false,
    },
};
