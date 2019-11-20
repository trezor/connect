import sys
import os
import signal
import time
from subprocess import Popen, PIPE

from trezorlib import device, debuglink, log
from trezorlib.debuglink import DebugLink, TrezorClientDebugLink
from trezorlib.ui import ClickUI
from trezorlib.client import TrezorClient
from trezorlib.transport import enumerate_devices, get_transport
from trezorlib.transport.udp import UdpTransport
from trezorlib.transport.bridge import BridgeTransport

proc = None
# log.enable_debug_output()

def start():
    global proc
    if proc is None:
        # TODO:
        # - check if emulator process is already running and kill it if so
        # - detect if Popen process starts without error (if udp port is listening)
        # - run custom firmware
        # - run T1 emulator
        # - run T1 & T2 emulator at once
        # - run two T2/T1 emulators
        # - add some debug param to catch stdout in parent app
        proc = Popen(
            "./emu.sh",
            cwd="../trezor-firmware/core",
            env=dict(os.environ, PYOPT="0"),
            stdout=PIPE,
            stderr=PIPE,
            # stdout=sys.stdout,
            # stdout=sys.stderr,
            shell=True,
            preexec_fn=os.setsid
        )
        
        time.sleep(3) # replace this with "wait_for_emulator" process

def stop():
    global proc
    if proc is not None:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc = None

def get_udp_device():
    devices = UdpTransport.enumerate()
    for d in devices:
        # debugBridge = d.find_debug()
        return d
    raise RuntimeError("No debuggable device found")

def get_bridge_device():
    devices = BridgeTransport.enumerate()
    for d in devices:
        debugBridge = d.find_debug()
        return d
    raise RuntimeError("No debuggable device found")

def setup_device(mnemonic, pin, passphrase_protection, label):
    # Setup link
    # transport = get_udp_device()
    # TODO:
    # - check if device is acquired otherwise throws "wrong previous session" from bridge
    transport = get_bridge_device()
    client = TrezorClientDebugLink(transport)
    client.open()
    device.wipe(client)
    debuglink.load_device_by_mnemonic(client, mnemonic=mnemonic, pin=pin, passphrase_protection=passphrase_protection, label=label)
    client.close()

def decision():
    # Setup link
    transport = get_bridge_device()
    client = DebugLink(transport.find_debug())
    client.open()
    client.press_yes()
    # client.swipe_down()
    client.close()