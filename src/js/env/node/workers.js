import path from 'path';
import TinyWorker from 'tiny-worker';

// webpack needs to compile and export those files
/* eslint-disable no-unused-vars */
import FastXpubWasmLoader from 'hd-wallet/lib/fastxpub/fastxpub.wasm';
import FastXpubWorkerLoader from 'worker-loader?name=js/fastxpub-worker.js!hd-wallet/lib/fastxpub/fastxpub.js';
import DiscoveryWorkerLoader from 'worker-loader?name=js/discovery-worker.js!hd-wallet/lib/discovery/worker/inside';
import SocketWorkerLoader from 'worker-loader?name=js/socketio-worker.js!hd-wallet/lib/socketio-worker/inside';
import RippleWorkerLoader from 'worker-loader?name=js/ripple-worker.js!trezor-blockchain-link/lib/workers/ripple/index.js';
/* eslint-enable no-unused-vars */

export const SharedConnectionWorker = () => {
    return 'not-used-in-node.js';
};

// export const FastXpubWasm = path.resolve(global.TREZOR_CONNECT_ASSETS, './js/fastxpub-worker.js');
export const FastXpubWasm = './build/js/fastxpub.wasm';

export const FastXpubWorker = () => {
    return new TinyWorker(path.resolve(global.TREZOR_CONNECT_ASSETS, './js/fastxpub-worker.js'));
};

export const DiscoveryWorker = () => {
    return new TinyWorker(path.resolve(global.TREZOR_CONNECT_ASSETS, './js/discovery-worker.js'));
};

export const SocketWorker = () => {
    return new TinyWorker(path.resolve(global.TREZOR_CONNECT_ASSETS, './js/socketio-worker.js'));
};

export const RippleWorker = () => {
    return new TinyWorker(path.resolve(global.TREZOR_CONNECT_ASSETS, './js/ripple-worker.js'));
};
