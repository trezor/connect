// import RippleWorker from 'worker-loader?name=workers/ripple-worker.js!trezor-blockchain-link/workers/ripple-worker';
import FastXpubWasm from 'hd-wallet/lib/fastxpub/fastxpub.wasm';
import FastXpubWorker from 'worker-loader?name=workers/fastxpub-worker.js!hd-wallet/lib/fastxpub/fastxpub.js';
import DiscoveryWorker from 'worker-loader?name=workers/discovery-worker.js!hd-wallet/lib/discovery/worker/inside';
import SocketWorker from 'worker-loader?name=workers/socketio-worker.js!hd-wallet/lib/socketio-worker/inside';
import RippleWorker from 'worker-loader?name=workers/ripple-worker.js!trezor-blockchain-link/lib/workers/ripple/index.js';
