import path from 'path';
import { spawn } from 'child_process';

const spawnProcess = () => {
    const src = path.resolve(__dirname, './python/main.py');
    const child = spawn('python3', [src], {
        // stdio: [process.stdin, process.stdout, process.stderr],
        stdio: ['ignore', 'ignore', 'ignore'],
    });
    return child;
};

module.exports = function () {
    global.pythonProcess = spawnProcess();
};
