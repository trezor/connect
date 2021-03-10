import SharedConnectionWorker from 'trezor-link/lib/lowlevel/sharedConnectionWorker';
import BlockbookWorker from '@trezor/blockchain-link/lib/workers/blockbook';
import RippleWorker from '@trezor/blockchain-link/lib/workers/ripple';

import TrezorLink from 'trezor-link';

const WebUsbPlugin = () =>
    new TrezorLink.Lowlevel(
        new TrezorLink.WebUsb(),
        typeof SharedWorker !== 'undefined' ? () => new SharedConnectionWorker() : null,
    );

const ReactNativeUsbPlugin = undefined;

export { WebUsbPlugin, ReactNativeUsbPlugin, BlockbookWorker, RippleWorker };
