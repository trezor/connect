import sys
import os

from argparse import ArgumentParser

from trezorlib.client import TrezorClientDebugLink
from trezorlib.transport import get_transport

def get_device():
    path = os.environ.get('TREZOR_PATH')
    return get_transport(path)

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
    debuglink = wirelink.find_debug()

    client = TrezorClientDebugLink(wirelink)
    client.set_debuglink(debuglink)
    # Setup link: END

    client.wipe_device()
    client.transport.session_begin()

    client.load_device_by_mnemonic(
        mnemonic=args.mnemonic, pin=args.pin, passphrase_protection=args.passphrase, label='test')


    print(client.features)

    client.transport.session_end()
    client.close()

if __name__ == '__main__':
    main()
