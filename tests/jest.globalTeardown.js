module.exports = function () {
    if (global.pythonProcess) {
        try {
            // global.pythonProcess.stdin.pause();
            // global.pythonProcess.kill('SIGINT');
            process.kill(global.pythonProcess.pid, 'SIGINT');
        } catch (error) {
            // console.log("Kill pythonProcess error", error);
        }
        global.pythonProcess = null;
    }
};
