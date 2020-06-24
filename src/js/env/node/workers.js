/* @flow */
/* istanbul ignore next */
import TinyWorker from 'tiny-worker';
import type { Transport } from 'trezor-link';

type TransportWrapper = () => Transport;

export const WebUsbPlugin: TransportWrapper | typeof undefined = undefined;
export const ReactNativeUsbPlugin: TransportWrapper | typeof undefined = undefined;

export const BlockbookWorker = () => {
    return new TinyWorker(() => {
        // $FlowIssue
        require('@trezor/blockchain-link/lib/workers/blockbook');
        // require('@trezor/blockchain-link/build/node/blockbook-worker');
    });
};

export const RippleWorker = () => {
    return new TinyWorker(() => {
        // $FlowIssue todo: node build for ripple worker seems to be broken. as a workaround require lib
        require('@trezor/blockchain-link/lib/workers/ripple');
    });
};
