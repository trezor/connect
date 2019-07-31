import fse from 'fs-extra';
import path from 'path';
import packageJSON from '../package.json';

const src = path.resolve(__dirname, '../src/js');
const npm = path.resolve(__dirname, '../npm-extended');
const lib = path.resolve(__dirname, '../npm-extended/lib');
const dataSrc = path.resolve(__dirname, '../src/data');
const data = path.resolve(__dirname, '../npm-extended/data');

// copy all js files any make a copy with .flow extension
fse.copySync(src, lib, {
    filter: function (src, dest) {
        // do not copy "*/_old" directory
        if (src.indexOf('_old') >= 0) return false;
        const ext = src.split('.').pop();
        if (ext === 'js') {
            fse.copySync(src, dest + '.flow');
        }
        return true;
    },
});

// copy assets (only json)
fse.copySync(dataSrc, data, {
    filter: function (src, dest) {
        const ext = src.split('.').pop();
        const copy = ext === 'json' || ext.indexOf('/') >= 0;
        return copy;
    },
});

// modify package.json
packageJSON.dependencies = {
    ...packageJSON.dependencies,
    ...packageJSON.extendedDependencies,
};
delete packageJSON.devDependencies;
delete packageJSON.extendedDependencies;
delete packageJSON.scripts;
delete packageJSON.bin;
delete packageJSON.private;
packageJSON.main = 'lib/index.js';

fse.writeFileSync(path.resolve(npm, 'package.json'), JSON.stringify(packageJSON, null, '  '), 'utf-8');

// copy static files
fse.copySync(path.resolve(__dirname, '../README.md'), path.resolve(npm, 'README.md'));
fse.copySync(path.resolve(__dirname, '../LICENSE.md'), path.resolve(npm, 'LICENSE.md'));
fse.copySync(path.resolve(__dirname, '../CHANGELOG.md'), path.resolve(npm, 'CHANGELOG.md'));
