/**
 * This is a simple web server used for integration tests so we can
 * apply different parameters to Trezor Connect without having to
 * duplicate files, but instead we pass a query paramter that will
 * render a template with the right settings.
 */
const path = require('path');
const url = require('url');
const express = require('express');
const app = express();

const port = 3000;
const buildPath = path.join(__dirname, '..', '..', '..', 'build');

let server;

const runServer = ({ scriptName }) => new Promise((resolve, reject) => {
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use('/static', express.static(buildPath));

    app.get('/', (req, res) => {
        const { p } = url.parse(req.url, true).query;

        res.render('default', {
            scriptName,
            params: p,
        });
    });

    server = app.listen(port, () => resolve());
});

const stopServer = () => new Promise((resolve) => {
    server.close(() => resolve());
});

module.exports = {
    runServer,
    stopServer,
};
