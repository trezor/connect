/* eslint-disable no-unused-vars */
import SharedConnectionWorker from 'sharedworker-loader?name=js/shared-connection-worker.[hash].js!trezor-link/lib/lowlevel/sharedConnectionWorker';
import FastXpubWasm from 'hd-wallet/lib/fastxpub/fastxpub.wasm';
import FastXpubWorker from 'worker-loader?name=workers/fastxpub-worker.[hash].js!hd-wallet/lib/fastxpub/fastxpub.js';
import DiscoveryWorker from 'worker-loader?name=workers/discovery-worker.[hash].js!hd-wallet/lib/discovery/worker/inside';
import SocketWorker from 'worker-loader?name=workers/socketio-worker.[hash].js!hd-wallet/lib/socketio-worker/inside';
import RippleWorker from 'worker-loader?name=workers/ripple-worker.[hash].js!trezor-blockchain-link/lib/workers/ripple/index.js';

export {
    SharedConnectionWorker,
    FastXpubWasm,
    FastXpubWorker,
    DiscoveryWorker,
    SocketWorker,
    RippleWorker,
};
