import https from 'https';
import fs from 'fs';
import { DATA_SRC } from './constants';

const dependencies = [
    {
        url: 'https://raw.githubusercontent.com/trezor/webwallet-data/master/bridge/latest.txt',
        destination: `${DATA_SRC}latest.txt`,
    },
    {
        url: 'https://raw.githubusercontent.com/trezor/webwallet-data/master/config_signed.bin',
        destination: `${DATA_SRC}config_signed.bin`,
    },
    {
        url: 'https://raw.githubusercontent.com/trezor/webwallet-data/master/firmware/1/releases.json',
        destination: `${DATA_SRC}releases-1.json`,
    },
    {
        url: 'https://raw.githubusercontent.com/trezor/webwallet-data/master/firmware/2/releases.json',
        destination: `${DATA_SRC}releases-2.json`,
    },
    // {
    //     url: 'https://raw.githubusercontent.com/trezor/trezor-common/master/coins.json',
    //     destination: `${DATA_SRC}coins.json`
    // },
];

function getFile(callback) {
    if (dependencies.length === 0) return;

    const resource = dependencies[0];
    const url = resource.url;
    const destination = resource.destination;

    console.log('Downloading dependency from git', url);
    const file = fs.createWriteStream(destination);
    https.get(url, function (response) {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', function () {
                console.log('Done... Saving', destination);
                file.close(callback); // close() is async, call cb after close completes.
            });
        } else {
            console.error('\x1b[41m', 'Error downloading... file ' + destination + ' not saved!', '\x1b[0m');
            callback();
        }
    }).on('error', function (err) { // Handle errors
        fs.unlink(destination); // Delete the file async. (But we don't check the result)
        console.error('\x1b[41m', 'Error downloading... file ' + destination + ' not saved!', err.message, '\x1b[0m');
        callback();
    });
}

export default function downloadDependencies() {
    const callback = () => {
        dependencies.splice(0, 1);
        getFile(callback);
    };
    getFile(callback);
}
