import BlockbookWorkerWrapper from '@trezor/blockchain-link/build/module/blockbook-worker.js';
import RippleWorkerWrapper from '@trezor/blockchain-link/build/module/ripple-worker.js';

export const SharedConnectionWorker = () => {
    return null;
};

export const BlockbookWorker = () => {
    return new BlockbookWorkerWrapper();
};

export const RippleWorker = () => {
    return new RippleWorkerWrapper();
};
