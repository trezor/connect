/* @flow */
/* istanbul ignore next */
import TinyWorker from 'tiny-worker';
import type { Transport } from 'trezor-link';

type TransportWrapper = () => Transport;

export const WebUsbPlugin: TransportWrapper | typeof undefined = undefined;
export const ReactNativeUsbPlugin: TransportWrapper | typeof undefined = undefined;

export const BlockbookWorker = () =>
    new TinyWorker(() => {
        // $FlowIssue
        require('@trezor/blockchain-link/build/node/blockbook-worker'); // eslint-disable-line global-require
    });

export const RippleWorker = () =>
    new TinyWorker(() => {
        // $FlowIssue
        require('@trezor/blockchain-link/build/node/ripple-worker'); // eslint-disable-line global-require
    });
