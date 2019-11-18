module.exports = function () {
    if (global.pythonProcess) {
        // console.log("TEAR", global.pythonProcess.pid)
        try {
            // global.pythonProcess.stdin.pause();
            // global.pythonProcess.kill('SIGINT');
            process.kill(global.pythonProcess.pid, 'SIGINT');
        } catch (error) {
            // console.log("KILL ERROR", error);
        }
    } else {
        // console.log("TEAR not found")
    }
};
