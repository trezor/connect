import TinyWorker from 'tiny-worker';

export const SharedConnectionWorker = () => {
    return null;
};

export const BlockbookWorker = () => {
    return new TinyWorker(() => {
        require('@trezor/blockchain-link/build/node/blockbook-worker');
    });
};

export const RippleWorker = () => {
    return new TinyWorker(() => {
        require('@trezor/blockchain-link/build/node/ripple-worker');
    });
};
