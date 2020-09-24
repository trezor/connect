import fs from 'fs-extra';
import path from 'path';
import { collectImportsSync } from 'babel-collect-imports';
import packageJSON from '../package.json';

const { internal } = collectImportsSync(path.resolve(__dirname, '../src/js/index.js'), undefined, undefined, {
    // replace default, node import by browser import
    pathFilter: (pkg, path, relativePath) => {
        if (relativePath === 'src/js/env/node') {
            return 'src/js/env/browser';
        }
        if (relativePath === 'src/js/env/node/index') {
            return 'src/js/env/browser/index';
        }
    },
});

const src = path.resolve(__dirname, '../src/js');
const ts = path.resolve(__dirname, '../src/ts/types');
const npm = path.resolve(__dirname, '../npm');
const lib = path.resolve(__dirname, '../npm/lib');

internal.forEach(file => {
    const libFile = file.replace(src, lib);
    fs.copySync(file, libFile);
    fs.copySync(file, libFile + '.flow');
});

const ignored = ['__tests__', '_old', 'icons', 'udev'];
const shouldIgnore = (src) => ignored.find(i => src.indexOf(i) >= 0);

// copy typescript
fs.copySync(ts, `${lib}/typescript`, {
    filter: function (src, dest) {
        if (shouldIgnore(src)) return false;
        if (src.indexOf('.json') >= 0) return false;
        return true;
    },
});

delete packageJSON.devDependencies;
delete packageJSON.extendedDependencies;
delete packageJSON.scripts;
delete packageJSON.bin;
delete packageJSON['react-native'];
delete packageJSON.private;
delete packageJSON.extendedDependencies;

packageJSON.main = 'lib/index.js';
packageJSON.types = 'lib/typescript/index.d.ts';

fs.writeFileSync(path.resolve(npm, 'package.json'), JSON.stringify(packageJSON, null, '  '), 'utf-8');

fs.copySync(path.resolve(src, 'env/node/index-empty.js'), path.resolve(npm, 'lib/env/node/index.js'));
fs.copySync(path.resolve(src, 'env/node/index-empty.js'), path.resolve(npm, 'lib/env/node/index.js.flow'));
fs.copySync(path.resolve(npm, '../README.md'), path.resolve(npm, 'README.md'));
fs.copySync(path.resolve(npm, '../LICENSE.md'), path.resolve(npm, 'LICENSE.md'));
fs.copySync(path.resolve(npm, '../CHANGELOG.md'), path.resolve(npm, 'CHANGELOG.md'));
