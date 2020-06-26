/* @flow */
/* istanbul ignore next */
import type { Transport } from 'trezor-link';
// $FlowIssue
import BlockbookWorkerWrapper from '@trezor/blockchain-link/build/module/blockbook-worker.js';
// $FlowIssue
import RippleWorkerWrapper from '@trezor/blockchain-link/build/module/ripple-worker.js';

type TransportWrapper = () => Transport;

export const WebUsbPlugin: TransportWrapper | typeof undefined = undefined;
export const ReactNativeUsbPlugin: TransportWrapper | typeof undefined = undefined;

export const BlockbookWorker = () => {
    return new BlockbookWorkerWrapper();
};

export const RippleWorker = () => {
    return new RippleWorkerWrapper();
};
