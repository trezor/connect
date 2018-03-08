import { JS_SRC, HTML_SRC, DIST, PORT } from './constants';
import express from 'express';
import webpack from 'webpack';
import config from './webpack.config.popup';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import open from 'open';
import { spawn } from 'child_process';
import { argv } from 'yargs';
import chokidar from 'chokidar';
import stylesheet from './stylesheet';


let index = null;

const app = express();
const compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
    contentBase: DIST,
    hot: true,
    inline: true,
    compress: true,
    noInfo: false,
    stats: { colors: true }
}));
app.use(webpackHotMiddleware(compiler));

app.get('*', function(req, res) {
    res.sendFile(HTML_SRC + req.params[0]);
});

app.listen(PORT, 'localhost', function(err) {
    if (err) {
        console.log(err);
        return;
    }
    open(`http://localhost:${PORT}/`);
    console.log(`Listening at http://localhost:${PORT}`);
});


// Watch less changes
const watcher = chokidar.watch('./src/styles/iframe/*.less');
watcher.on('ready', (a) => {
    watcher.on('all', (event, path) => {
        stylesheet(path, () => {
            console.log("CSS recompiled...");
        })
    });
});
