import SharedConnectionWorker from '@trezor/transport/lib/lowlevel/sharedConnectionWorker';
import BlockbookWorker from '@trezor/blockchain-link/lib/workers/blockbook';
import RippleWorker from '@trezor/blockchain-link/lib/workers/ripple';

import TrezorLink from '@trezor/transport';

const WebUsbPlugin = () =>
    new TrezorLink.Lowlevel(
        new TrezorLink.WebUsb(),
        typeof SharedWorker !== 'undefined' ? () => new SharedConnectionWorker() : null,
    );

const ReactNativeUsbPlugin = undefined;

export { WebUsbPlugin, ReactNativeUsbPlugin, BlockbookWorker, RippleWorker };
