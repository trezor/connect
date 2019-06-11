import path from 'path';
import TinyWorker from 'tiny-worker';

export const SharedConnectionWorker = () => {
    return null;
};

export const FastXpubWasm = path.resolve(process.cwd(), './node_modules/hd-wallet/lib/fastxpub/fastxpub.wasm');;

export const FastXpubWorker = () => {
    return new TinyWorker(() => {
        require('hd-wallet/lib/fastxpub/fastxpub');
    });
};

export const DiscoveryWorker = () => {
    return new TinyWorker(() => {
        require('hd-wallet/lib/discovery/worker/inside');
    });
};

export const SocketWorker = () => {
    return new TinyWorker(() => {
        require('hd-wallet/lib/socketio-worker/inside');
    });
};

export const RippleWorker = () => {
    return new TinyWorker(() => {
        require('trezor-blockchain-link/lib/workers/ripple/index');
    });
};
