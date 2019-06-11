import { Thread } from 'react-native-threads';

// webpack needs to compile and export those files
/* eslint-disable no-unused-vars */
// import FastXpubWasmLoader from 'hd-wallet/lib/fastxpub/fastxpub.wasm';
// import FastXpubWorkerLoader from 'worker-loader?name=js/fastxpub-worker.js!hd-wallet/lib/fastxpub/fastxpub.js';
// import DiscoveryWorkerLoader from 'worker-loader?name=js/discovery-worker.js!hd-wallet/lib/discovery/worker/inside';
// import SocketWorkerLoader from 'worker-loader?name=js/socketio-worker.js!hd-wallet/lib/socketio-worker/inside';
// import RippleWorkerLoader from 'worker-loader?name=js/ripple-worker.js!trezor-blockchain-link/lib/workers/ripple/index.js';
// import RippleWorkerLoader from 'worker-loader?name=js/ripple-worker.js!react-native-worker!trezor-blockchain-link/lib/workers/ripple/index.js';
/* eslint-enable no-unused-vars */

// import DiscoveryWorkerL from 'react-native-worker!hd-wallet/lib/discovery/worker/inside';
// import SocketWorkerL from 'react-native-worker?name=js/socketio-worker.js!hd-wallet/lib/socketio-worker/inside';
import RippleWorkerL from 'worker-loader?name=js/ripple-worker.js!react-native-worker!trezor-blockchain-link/lib/workers/ripple/index.js';

export const SharedConnectionWorker = () => {
    // return 'not-used-in-react-native.js';
};

export const FastXpubWasm = './js/fastxpub.wasm';

export const FastXpubWorker = () => {
    // return new Thread('./fastxpub-worker.js');
};

export const DiscoveryWorker = () => {
    // return new Thread('./discovery-worker.js');
};

export const SocketWorker = () => {
    // return new Thread('./socketio-worker.js');
};

export const RippleWorker = () => {
    // return new RippleWorkerL();
    return new Thread('./packages/native/trezor-connect/js/ripple-worker.js');
};
