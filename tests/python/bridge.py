import sys
import os
import signal
from subprocess import Popen, PIPE

proc = None

# def findProcess():
#     ps = Popen("ps -ef | grep trezord-go", shell=True, stdout=PIPE)
#     output = ps.stdout.read()
#     ps.stdout.close()
#     ps.wait()
#     return output

def start():
    global proc
    if proc is None:
        # findProcess()
        # TODO:
        # - check if trezord process is already running and kill it if so
        # - check if Popen process starts without error (if 21325 port is listening)
        # - custom path to binary (?)
        # - add some debug param to catch stdout in parent app
        proc = Popen(
            ["../trezord-go/trezord-go -ed 21324:21325"],
            stdout=PIPE,
            stderr=PIPE,
            # stdout=sys.stdout,
            # stdout=sys.stderr,
            shell=True,
            preexec_fn=os.setsid
        )
        # TODO: - add else condition and check if trezord is running and if i own this process (trezord pid is the same with proc pid)

def stop():
    global proc
    if proc is not None:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc = None
