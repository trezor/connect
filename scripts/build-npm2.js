import fse from 'fs-extra';
import path from 'path';
import packageJSON from '../package.json';

const src = path.resolve(__dirname, '../src/js');
const npm = path.resolve(__dirname, '../npm');
const lib = path.resolve(__dirname, '../npm/lib');
const dataSrc = path.resolve(__dirname, '../src/data');
const data = path.resolve(__dirname, '../npm/data');

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
delete packageJSON.devDependencies;
delete packageJSON.scripts;
delete packageJSON.bin;
delete packageJSON.private;
packageJSON.main = 'lib/index.js';

fse.writeFileSync(path.resolve(npm, 'package.json'), JSON.stringify(packageJSON, null, '  '), 'utf-8');

// copy scripts and hooks
fse.copySync(path.resolve(__dirname, '../scripts/extend.js'), path.resolve(npm, 'scripts/extend.js'));
fse.copySync(path.resolve(__dirname, '../scripts/postinstall.js'), path.resolve(npm, 'scripts/postinstall.js'));
fse.copySync(path.resolve(__dirname, '../src/__hooks/engine.io-websocket.js'), path.resolve(npm, '__hooks/engine.io-websocket.js'));

// copy static files
fse.copySync(path.resolve(__dirname, '../README.md'), path.resolve(npm, 'README.md'));
fse.copySync(path.resolve(__dirname, '../LICENSE.md'), path.resolve(npm, 'LICENSE.md'));
fse.copySync(path.resolve(__dirname, '../CHANGELOG.md'), path.resolve(npm, 'CHANGELOG.md'));
