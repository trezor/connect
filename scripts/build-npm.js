import fs from 'fs-extra';
import path from 'path';
import { collectImportsSync } from 'babel-collect-imports';
import packageJSON from '../package.json';

const { internal } = collectImportsSync(path.resolve(__dirname, '../src/js/index.js'));

const src = path.resolve(__dirname, '../src/js');
const npm = path.resolve(__dirname, '../npm');
const lib = path.resolve(__dirname, '../npm/lib');

internal.forEach(file => {
    const libFile = file.replace(src, lib);
    fs.copySync(file, libFile);
    fs.copySync(file, libFile + '.flow');
});

delete packageJSON.devDependencies;
delete packageJSON.scripts;
delete packageJSON.bin;

packageJSON.dependencies = {
    ...packageJSON.dependencies,
    ...packageJSON.npmDependencies,
};
delete packageJSON.npmDependencies;

packageJSON.main = 'lib/index.js';
fs.writeFileSync(path.resolve(npm, 'package.json'), JSON.stringify(packageJSON, null, '  '), 'utf-8');

fs.copySync(path.resolve(npm, '../README.md'), path.resolve(npm, 'README.md'));
fs.copySync(path.resolve(npm, '../LICENSE.md'), path.resolve(npm, 'LICENSE.md'));
fs.copySync(path.resolve(npm, '../CHANGELOG.md'), path.resolve(npm, 'CHANGELOG.md'));
