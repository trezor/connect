import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { collectImportsSync } from 'babel-collect-imports';
import packageJSON from '../package.json';

let { internal, external } = collectImportsSync( path.resolve(__dirname, '../src/js/index.js') );

console.log("EXTERNAL", external)

const src = path.resolve(__dirname,'../src/js');
const npm = path.resolve(__dirname,'../npm');
const lib = path.resolve(__dirname,'../npm/lib');
const flowtypeSrc = path.resolve(__dirname,'../src/flowtype');
const flowtypeNpm = path.resolve(__dirname,'../npm/flowtype');

internal.forEach(file => {
    const libFile = file.replace(src, lib);
    fs.copySync(file, libFile);
    fs.copySync(file, libFile + '.flow');
});

// exec('../node_modules/.bin/babel ../npm/lib --out-dir ../npm/lib');

delete packageJSON.devDependencies;
delete packageJSON.scripts;
delete packageJSON.bin;

packageJSON.main = "lib/index.js";
fs.writeFileSync(path.resolve(npm, 'package.json'), JSON.stringify(packageJSON, null, '  '), 'utf-8');


fs.copySync( path.resolve(npm, '../README.md') , path.resolve(npm, 'README.md'));
fs.copySync( path.resolve(npm, '../COPYING') , path.resolve(npm, 'COPYING'));
// fs.copySync( path.resolve(npm, '../LICENSE.txt') , path.resolve(npm, 'LICENSE.txt'));
fs.copySync( path.resolve(npm, '../CHANGELOG.md') , path.resolve(npm, 'CHANGELOG.md'));

fs.copySync( path.resolve(flowtypeSrc, 'trezor.js') , path.resolve(flowtypeNpm, 'trezor.js'));
fs.copySync( path.resolve(flowtypeSrc, 'trezor-connect.js') , path.resolve(flowtypeNpm, 'trezor-connect.js'));
fs.copySync( path.resolve(flowtypeSrc, 'params.js') , path.resolve(flowtypeNpm, 'params.js'));
fs.copySync( path.resolve(flowtypeSrc, 'response.js') , path.resolve(flowtypeNpm, 'response.js'));

/*
cp README.md ./dist/README.md
	cp COPYING ./dist/COPYING
	cp CHANGELOG.md ./dist/CHANGELOG.md
	mkdir -p ./dist/flowtype
	cp ./src/flowtype/trezor.js ./dist/flowtype/trezor.js
	cp ./src/flowtype/trezor-connect.js ./dist/flowtype/trezor-connect.js
	cp ./src/flowtype/trezor-connect-params.js ./dist/flowtype/trezor-connect-params.js
	cp ./src/flowtype/trezor-connect-response.js ./dist/flowtype/trezor-connect-response.js
*/
