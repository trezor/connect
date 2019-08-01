/* eslint-disable no-unused-vars */
import SharedConnectionWorker from 'sharedworker-loader?name=workers/shared-connection-worker.[hash].js!trezor-link/lib/lowlevel/sharedConnectionWorker';
import BlockbookWorker from 'worker-loader?name=workers/blockbook-worker.[hash].js!@trezor/blockchain-link/lib/workers/blockbook/index.js';
import RippleWorker from 'worker-loader?name=workers/ripple-worker.[hash].js!@trezor/blockchain-link/lib/workers/ripple/index.js';

export {
    SharedConnectionWorker,
    BlockbookWorker,
    RippleWorker,
};
