import fse from 'fs-extra';
import path from 'path';
import packageJSON from '../package.json';

const SRC = path.resolve(__dirname, '../src/js');
const TS = path.resolve(__dirname, '../src/ts/types');
const NPM = path.resolve(__dirname, '../npm-extended');
const LIB = path.resolve(__dirname, '../npm-extended/lib');
const DATA_SRC = path.resolve(__dirname, '../src/data');
const DATA = path.resolve(__dirname, '../npm-extended/data');

const ignored = ['__tests__', '_old', 'icons', 'udev'];
const shouldIgnore = src => ignored.find(i => src.indexOf(i) >= 0);

// copy all js files any make a copy with .flow extension
fse.copySync(SRC, LIB, {
    filter: (src, dest) => {
        if (shouldIgnore(src)) return false;
        const ext = src.split('.').pop();
        if (ext === 'js') {
            fse.copySync(src, `${dest}.flow`);
        }
        return true;
    },
});

// copy typescript
fse.copySync(TS, `${LIB}/typescript`, {
    filter: (src, _dest) => {
        if (shouldIgnore(src)) return false;
        if (src.indexOf('.json') >= 0) return false;
        return true;
    },
});

// copy assets (only json)
fse.copySync(DATA_SRC, DATA, {
    filter: (src, _dest) => !shouldIgnore(src),
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
if (!packageJSON.version.indexOf('-') > 0) {
    packageJSON.version += '-extended';
}
packageJSON.main = 'lib/index.js';
packageJSON.types = 'lib/typescript/index.d.ts';

fse.writeFileSync(
    path.resolve(NPM, 'package.json'),
    JSON.stringify(packageJSON, null, '  '),
    'utf-8',
);

// copy static files
fse.copySync(path.resolve(__dirname, '../README.md'), path.resolve(NPM, 'README.md'));
fse.copySync(path.resolve(__dirname, '../LICENSE.md'), path.resolve(NPM, 'LICENSE.md'));
fse.copySync(path.resolve(__dirname, '../CHANGELOG.md'), path.resolve(NPM, 'CHANGELOG.md'));
