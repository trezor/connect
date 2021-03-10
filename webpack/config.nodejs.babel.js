import CopyWebpackPlugin from 'copy-webpack-plugin';
import { SRC, JS_SRC, DATA_SRC, DIST, LIB_NAME, NODE_MODULES } from './constants';

// node build with Core logic and assets

module.exports = {
    mode: 'production',
    target: 'node',
    entry: {
        'trezor-connect': `${JS_SRC}index.js`,
    },
    output: {
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
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
        ],
    },
    resolve: {
        modules: [SRC, 'node_modules'],
    },
    performance: {
        hints: false,
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: DATA_SRC, to: `${DIST}data` },
                { from: `${NODE_MODULES}tiny-worker/lib/worker.js`, to: `${DIST}js/worker.js` },
                { from: `${NODE_MODULES}tiny-worker/lib/noop.js`, to: `${DIST}js/noop.js` },
            ],
        }),
    ],

    optimization: {
        emitOnErrors: true,
        moduleIds: 'named',
        minimize: false,
    },
};
