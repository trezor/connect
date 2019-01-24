import fs from 'fs-extra';
import path from 'path';
import replace from 'replace-in-file';
import { collectImportsSync } from 'babel-collect-imports';
import packageJSON from '../package.json';

const { internal } = collectImportsSync(path.resolve(__dirname, '../src/js/node/index.js'));
// const { internal } = collectImportsSync(path.resolve(__dirname, '../src/js/backend/BlockBook.js'));

const src = path.resolve(__dirname, '../src/js');
const npm = path.resolve(__dirname, '../npm-node');
const lib = path.resolve(__dirname, '../npm-node/lib');

internal.forEach(file => {
    const libFile = file.replace(src, lib);
    fs.copySync(file, libFile);
    fs.copySync(file, libFile + '.flow');
});

// replace "networkUtils" to node.js specific
const networkUtilsFile = path.resolve(__dirname, '../src/js/node/networkUtils.js');
const libNetworkUtilsFile = networkUtilsFile.replace(src + '/node', lib + '/utils');
fs.copySync(networkUtilsFile, libNetworkUtilsFile);
fs.copySync(networkUtilsFile, libNetworkUtilsFile + '.flow');

delete packageJSON.devDependencies;
delete packageJSON.scripts;
delete packageJSON.bin;

packageJSON.dependencies = {
    ...packageJSON.dependencies,
    ...packageJSON.nodeDependencies,
};
delete packageJSON.npmDependencies;
delete packageJSON.nodeDependencies;

const from = [
    /\/\/ nodejs-replace-start([\s\S]*)nodejs-replace-end/g,
    '/* nodejs-imports-start',
    'nodejs-imports-end */',
];
const to = ['', '', ''];

replace({
    files: [
        lib + '/device/DeviceList.js',
        lib + '/device/DeviceList.js.flow',
    ],
    from,
    to,
});

replace({
    files: [
        lib + '/backend/BlockchainLink.js',
        lib + '/backend/BlockchainLink.js.flow',
    ],
    from,
    to,
});

replace({
    files: [
        lib + '/backend/BlockBook.js',
        lib + '/backend/BlockBook.js.flow',
    ],
    from,
    to,
});

packageJSON.main = 'lib/node/index.js';
fs.writeFileSync(path.resolve(npm, 'package.json'), JSON.stringify(packageJSON, null, '  '), 'utf-8');

fs.copySync(path.resolve(npm, '../README.md'), path.resolve(npm, 'README.md'));
fs.copySync(path.resolve(npm, '../LICENSE.md'), path.resolve(npm, 'LICENSE.md'));
fs.copySync(path.resolve(npm, '../CHANGELOG.md'), path.resolve(npm, 'CHANGELOG.md'));

fs.copySync(path.resolve(npm, '../src/data'), path.resolve(npm, 'assets/data'));
fs.unlink(path.resolve(npm, 'assets/trezor-connect.js'));
