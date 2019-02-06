import sys
import os

from argparse import ArgumentParser

from trezorlib import device, debuglink
from trezorlib.debuglink import TrezorClientDebugLink
from trezorlib.transport import enumerate_devices, get_transport

def get_device():
    path = os.environ.get('TREZOR_PATH')
    if path:
        return get_transport(path)
    else:
        devices = enumerate_devices()
        for d in devices:
            if hasattr(d, "find_debug"):
                return d
        raise RuntimeError("No debuggable device found")

def main():
    parser = ArgumentParser()
    parser.add_argument("-m", dest="mnemonic", help="Set mnemonic", type=str)
    parser.add_argument("-p", dest="pin", help="Set pin", type=str)
    parser.add_argument("--passphrase", dest="passphrase", help="Enable passphrase", action="store_true")
    parser.add_argument("--no-passphrase", dest="passphrase", help="Enable passphrase", action="store_false")
    parser.set_defaults(passphrase=True)

    args = parser.parse_args()

    # Setup link
    wirelink = get_device()
    client = TrezorClientDebugLink(wirelink)
    client.open()
    device.wipe(client)

    debuglink.load_device_by_mnemonic(
        client,
        mnemonic=args.mnemonic,
        pin=args.pin,
        passphrase_protection=args.passphrase,
        label='test'
    )


    print(args.mnemonic)
    print(client.features)
    client.close()

if __name__ == '__main__':
    main()
