import { SRC, HTML_SRC, JS_SRC, DIST, LIB_NAME, NODE_MODULES } from './constants';
import webpack from 'webpack';
import WebpackPreBuildPlugin from 'pre-build-webpack';
import https from 'https';
import fs from 'fs';


module.exports = {
    devtool: 'inline-source-map',
    entry: [
        'webpack/hot/dev-server',
        'webpack-hot-middleware/client',
    ],
    output: {
        filename: '[name].js?init',
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
                test: /\.json$/,
                loader: 'json-loader'
            }
        ]
    },
    resolve: {
        modules: [ SRC, NODE_MODULES ]
    },
    performance: {
        hints: false
    },
    plugins: [
        new WebpackPreBuildPlugin(downloadDependencies),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('development'),
            PRODUCTION: JSON.stringify(false)
        })
    ]
}

const dependencies = [
    {
        url: 'https://raw.githubusercontent.com/trezor/webwallet-data/master/bridge/latest.txt',
        destination: `${HTML_SRC}latest.txt`
    },
    {
        url: 'https://raw.githubusercontent.com/trezor/webwallet-data/master/config_signed.bin',
        destination: `${HTML_SRC}config_signed.bin`
    },
    {
        url: 'https://raw.githubusercontent.com/trezor/webwallet-data/master/firmware/releases.json',
        destination: `${HTML_SRC}releases.json`
    },
    {
        url: 'https://raw.githubusercontent.com/trezor/trezor-common/master/coins.json',
        destination: `${HTML_SRC}coins.json`
    },
]

function downloadDependencies() {
    const callback = () =>{
        dependencies.splice(0, 1);
        getFile(callback);
    }
    getFile(callback);
}

function getFile(callback) {

    if (dependencies.length === 0) return;

    const resource = dependencies[0];
    const url = resource.url;
    const destination = resource.destination;

    console.log("Downloading dependency from git", url);
    var file = fs.createWriteStream(destination);
    var request = https.get(url, function(response) {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', function() {
                console.log("Done... Saving", destination);
                file.close( callback );  // close() is async, call cb after close completes.
            });
        } else {
            console.error('\x1b[41m', "Error downloading... file " + destination + " not saved!", '\x1b[0m');
            callback();
        }
    }).on('error', function(err) { // Handle errors
        fs.unlink(destination); // Delete the file async. (But we don't check the result)
        console.error('\x1b[41m', "Error downloading... file " + destination + " not saved!", err.message, '\x1b[0m');
        callback();
    });
}
