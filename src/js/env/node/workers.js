/* @flow */
/* istanbul ignore next */
import TinyWorker from 'tiny-worker';
import type { Transport } from '@trezor/transport';

type TransportWrapper = () => Transport;

export const WebUsbPlugin: TransportWrapper | typeof undefined = undefined;
export const ReactNativeUsbPlugin: TransportWrapper | typeof undefined = undefined;

export const BlockbookWorker = () =>
    new TinyWorker(() => {
        // $FlowIssue
        require('@trezor/blockchain-link/lib/workers/blockbook'); // eslint-disable-line global-require
    });

export const RippleWorker = () =>
    new TinyWorker(() => {
        // $FlowIssue
        require('@trezor/blockchain-link/lib/workers/ripple'); // eslint-disable-line global-require
    });

export const BlockfrostWorker = () =>
    new TinyWorker(() => {
        // $FlowIssue
        require('@trezor/blockchain-link/lib/workers/blockfrost'); // eslint-disable-line global-require
    });
