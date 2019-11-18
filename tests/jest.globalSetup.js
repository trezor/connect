import path from 'path';
import { spawn } from 'child_process';

const spawnProcess = () => {
    const src = path.resolve(__dirname, './python/main.py');
    const child = spawn('python3', [src], {
        detached: true,
    });
    // child.stdout.setEncoding('utf8');
    // child.stdout.on('data', data => {
    //     console.log('stdout: ' + data);
    // });

    // child.on('error', err => {
    //     // error(err);
    //     // console.log("ERROR", err, __dirname)
    // });
    return child;
};

module.exports = function () {
    global.pythonProcess = spawnProcess();
    // process.on('exit', () => {
    //     console.log("EXIT PROCESSSS", pythonProcess.pid)
    //     // try {
    //     //     // global.pythonProcess.stdin.pause();
    //     //     pythonProcess.kill('SIGINT');
    //     //     // process.kill(global.pythonProcess.pid, "SIGTERM")
    //     // } catch(error) {
    //     //     console.log("KILL ERROR", error);
    //     // }
    // });
    // console.log("SETUP", global.pythonProcess.pid)
};
