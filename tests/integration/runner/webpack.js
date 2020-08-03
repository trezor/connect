const path = require('path');
const webpack = require('webpack');

const configPath = path.join(__dirname, '..', '..', '..', 'webpack', 'config.prod.babel');
const webpackConfig = require(configPath);

const runBuild = () => new Promise((resolve, reject) => {
    webpack({
        ...webpackConfig,
    }, (err, stats) => {
        if (err) {
            console.error(err.stack || err);

            if (err.details) {
                console.error(err.details);
            }

            return reject(err);
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
            console.error(info.errors);
        }

        if (stats.hasWarnings()) {
            console.warn(info.warnings);
        }

        return resolve(info);
    });
});

module.exports = {
    runBuild,
};
