import { Thread } from 'react-native-threads';

// webpack needs to compile and export those files
/* eslint-disable no-unused-vars */
// import RippleWorkerLoader from 'worker-loader?name=js/ripple-worker.js!trezor-blockchain-link/lib/workers/ripple/index.js';
// import RippleWorkerLoader from 'worker-loader?name=js/ripple-worker.js!react-native-worker!trezor-blockchain-link/lib/workers/ripple/index.js';
/* eslint-enable no-unused-vars */

// import DiscoveryWorkerL from 'react-native-worker!hd-wallet/lib/discovery/worker/inside';
// import SocketWorkerL from 'react-native-worker?name=js/socketio-worker.js!hd-wallet/lib/socketio-worker/inside';
// import RippleWorkerL from 'worker-loader?name=js/ripple-worker.js!react-native-worker!trezor-blockchain-link/lib/workers/ripple/index.js';

export const SharedConnectionWorker = () => {
    return null;
};

export const BlockbookWorker = () => {
    return new Thread('./packages/native/trezor-connect/js/ripple-worker.js');
};

export const RippleWorker = () => {
    // return new RippleWorkerL();
    return new Thread('./packages/native/trezor-connect/js/ripple-worker.js');
};
