import fse from 'fs-extra';
import path from 'path';
import packageJSON from '../package.json';

const src = path.resolve(__dirname, '../src/js');
const ts = path.resolve(__dirname, '../src/ts/types');
const npm = path.resolve(__dirname, '../npm-extended');
const lib = path.resolve(__dirname, '../npm-extended/lib');
const dataSrc = path.resolve(__dirname, '../src/data');
const data = path.resolve(__dirname, '../npm-extended/data');

const ignored = ['__tests__', '_old', 'icons', 'udev'];
const shouldIgnore = (src) => ignored.find(i => src.indexOf(i) >= 0);

// copy all js files any make a copy with .flow extension
fse.copySync(src, lib, {
    filter: function (src, dest) {
        if (shouldIgnore(src)) return false;
        const ext = src.split('.').pop();
        if (ext === 'js') {
            fse.copySync(src, dest + '.flow');
        }
        return true;
    },
});

// copy typescript
fse.copySync(ts, `${lib}/typescript`, {
    filter: function (src, dest) {
        if (shouldIgnore(src)) return false;
        if (src.indexOf('.json') >= 0) return false;
        return true;
    },
});

// copy assets (only json)
fse.copySync(dataSrc, data, {
    filter: function (src, dest) {
        return !shouldIgnore(src);
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
packageJSON.version = packageJSON.version + '-extended';
packageJSON.main = 'lib/index.js';
packageJSON.types = 'lib/typescript/index.d.ts';

fse.writeFileSync(path.resolve(npm, 'package.json'), JSON.stringify(packageJSON, null, '  '), 'utf-8');

// copy static files
fse.copySync(path.resolve(__dirname, '../README.md'), path.resolve(npm, 'README.md'));
fse.copySync(path.resolve(__dirname, '../LICENSE.md'), path.resolve(npm, 'LICENSE.md'));
fse.copySync(path.resolve(__dirname, '../CHANGELOG.md'), path.resolve(npm, 'CHANGELOG.md'));
