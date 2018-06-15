import sys, os

from argparse import ArgumentParser

from trezorlib.client import TrezorClientDebugLink
from trezorlib.transport import get_transport

def get_device():
    path = os.environ.get('TREZOR_PATH')
    return get_transport()

def main():
    parser = ArgumentParser()
    parser.add_argument("-m", dest="mnemonic", help="Set mnemonic", metavar="", type=str)
    parser.add_argument("-p", dest="pin", help="Set pin", metavar="", type=str)
    parser.add_argument("-s", "--passphrase_protection",
                        dest="passphrase_protection", help="Should enable passphrase", metavar="", type=bool)

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
        mnemonic=args.mnemonic, pin=args.pin, passphrase_protection=args.passphrase_protection, label='test')

    client.transport.session_end()
    client.close()

if __name__ == '__main__':
    main()
