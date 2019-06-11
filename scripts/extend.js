const execSync = require('child_process').execSync;
const packageJSON = require('../package.json');

const packages = [];
Object.keys(packageJSON.extendedDependencies).forEach(function (key) {
    packages.push(key + '@' + packageJSON.extendedDependencies[key]);
});

function add() {
    console.log('adding dependencies');
    try {
        execSync('yarn add ' + packages.join(' '), {stdio: [0, 1, 2]});
    } catch (error) {
        console.warn('yarn install error', error);
        try {
            execSync('npm install ' + packages.join(' ') + ' --save', {stdio: [0, 1, 2]});
        } catch (error2) {
            console.error('npm install error', error2);
        }
    }
}

const lifecycleEvent = process.env.npm_lifecycle_event;
const packageIsInstalling = (lifecycleEvent === 'postinstall');

if (!packageIsInstalling) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const question = `Following packages will be added to your package.json:\n ${packages.join('\n ')} \n\nPress Y to continue....`;
    readline.question(question, (name) => {
        if (name === 'Y') {
            add();
            console.log('---------------------------------------------------------------------------');
            console.log('Add following command to scripts.postinstall inside your package.json file:');
            console.log('      node ./node_modules/trezor-connect/scripts/postinstall.js');
            console.log('---------------------------------------------------------------------------');
        }
        readline.close();
    });
} else {
    add();
    require('./postinstall');
}

