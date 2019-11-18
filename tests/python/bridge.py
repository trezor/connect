import sys
import os
import signal
from subprocess import Popen, PIPE

proc = None

def findProcess():
    ps = Popen("ps -ef | grep trezord-go", shell=True, stdout=PIPE)
    output = ps.stdout.read()
    ps.stdout.close()
    ps.wait()
    return output

def start():
    global proc
    if proc is None:
        findProcess()
        proc = Popen(
            ["../trezord-go/trezord-go -ed 21324:21325"],
            # stdout=PIPE,
            stderr=PIPE,
            stdout=sys.stdout,
            # stdout=sys.stderr,
            shell=True,
            preexec_fn=os.setsid
        )

def stop():
    global proc
    if proc is not None:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc = None
