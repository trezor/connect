/* eslint-disable import/extensions */
/* @flow */

// $FlowIssue
import BlockbookWorkerWrapper from '@trezor/blockchain-link/build/module/blockbook-worker.js';
// $FlowIssue
import RippleWorkerWrapper from '@trezor/blockchain-link/build/module/ripple-worker.js';
import TrezorLink from '@trezor/transport';
import RNUsbPlugin from './RNUsbPlugin';

export const WebUsbPlugin = undefined;

export const ReactNativeUsbPlugin = () => new TrezorLink.Lowlevel(new RNUsbPlugin());

export const BlockbookWorker = () => new BlockbookWorkerWrapper();

export const RippleWorker = () => new RippleWorkerWrapper();
