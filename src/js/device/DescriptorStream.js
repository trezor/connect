/* @flow */
'use strict';

// This file reads descriptor with very little logic, and sends it to layers above

import EventEmitter from 'events';
import * as TRANSPORT from '../constants/transport';
import * as DEVICE from '../constants/device';

import Log, { init as initLog } from '../utils/debug';
import DataManager from '../data/DataManager';
import { httpRequest } from '../utils/networkUtils';

import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';

export type DeviceDescriptorDiff = {
    didUpdate: boolean,
    connected: Array<DeviceDescriptor>,
    disconnected: Array<DeviceDescriptor>,
    changedSessions: Array<DeviceDescriptor>,
    acquired: Array<DeviceDescriptor>,
    released: Array<DeviceDescriptor>,
    descriptors: Array<DeviceDescriptor>,
};

// custom log
const logger: Log = initLog('DescriptorStream');

export default class DescriptorStream extends EventEmitter {
    // actual low-level transport, from trezor-link
    transport: Transport;

    // if the transport works
    listening: boolean = false;

    // if transport fetch API rejects (when computer goes to sleep)
    failedToFetchTimestamp: number = 0;

    // null if nothing
    current: ?Array<DeviceDescriptor> = null;
    upcoming: Array<DeviceDescriptor> = [];

    constructor(transport: Transport) {
        super();
        this.transport = transport;
        logger.enabled = DataManager.getSettings('debug');
    }

    // emits changes
    async listen(): Promise<void> {
        // if we are not enumerating for the first time, we can let
        // the transport to block until something happens
        const waitForEvent: boolean = this.current !== null;
        const current: Array<DeviceDescriptor> = this.current || [];

        this.listening = true;

        let descriptors: Array<DeviceDescriptor>;
        try {
            logger.debug('Start listening', current);
            descriptors = waitForEvent ? await this.transport.listen(current) : await this.transport.enumerate();
            if (!this.listening) return; // do not continue if stop() was called

            this.upcoming = descriptors;
            logger.debug('Listen result', descriptors);
            this._reportChanges();
            this.failedToFetchTimestamp = 0;
            if (this.listening) this.listen(); // handlers might have called stop()
        } catch (error) {
            const ts: number = new Date().getTime();
            logger.debug('Listen error', error.message, this.failedToFetchTimestamp, ts, ts - this.failedToFetchTimestamp, window.navigator.onLine);
            if (error && typeof error.message === 'string' && error.message.toLowerCase() === 'failed to fetch') {
                // workaround for windows
                // to make sure that this error was caused by "err_network_io_suspended"
                // try to fetch resource that is definitely present, if this request is also failing it means that computer is in hibernate state
                try {
                    await httpRequest('data/config.json', 'json');
                    // this wasn't the reason, bridge is probably missing. Throw error
                    console.log("config fetched!");
                    this.emit(TRANSPORT.ERROR, error);
                } catch (fetchError) {
                    console.log("Failed to load", fetchError);
                    // wait one second and try again
                    window.setTimeout(() => {
                        if (this.listening) this.listen();
                    }, 1000)
                }

                this.failedToFetchTimestamp = ts;

            } else {
                logger.log("Transport error catched... emit");
                this.emit(TRANSPORT.ERROR, error);
            }
        }
    }

    stop(): void {
        this.listening = false;
    }

    _diff(currentN: ?Array<DeviceDescriptor>, descriptors: Array<DeviceDescriptor>): DeviceDescriptorDiff {
        const current: Array<DeviceDescriptor> = currentN || [];
        const connected: Array<DeviceDescriptor> = descriptors.filter((d: DeviceDescriptor) => {
            return current.find((x: DeviceDescriptor) => {
                return x.path === d.path;
            }) === undefined;
        });
        const disconnected: Array<DeviceDescriptor> = current.filter((d: DeviceDescriptor) => {
            return descriptors.find((x: DeviceDescriptor) => {
                return x.path === d.path;
            }) === undefined;
        });
        const changedSessions: Array<DeviceDescriptor> = descriptors.filter((d: DeviceDescriptor) => {
            const currentDescriptor: ?DeviceDescriptor = current.find((x: DeviceDescriptor) => {
                return x.path === d.path;
            });
            if (currentDescriptor) {
                return (currentDescriptor.session !== d.session);
            } else {
                return false;
            }
        });
        const acquired: Array<DeviceDescriptor> = changedSessions.filter((descriptor: DeviceDescriptor) => {
            return descriptor.session != null;
        });
        const released: Array<DeviceDescriptor> = changedSessions.filter((descriptor: DeviceDescriptor) => {
            return descriptor.session == null;
        });

        const didUpdate: boolean = (connected.length + disconnected.length + changedSessions.length) > 0;

        return {
            connected: connected,
            disconnected: disconnected,
            changedSessions: changedSessions,
            acquired: acquired,
            released: released,
            didUpdate: didUpdate,
            descriptors: descriptors,
        };
    }

    _reportChanges(): void {
        const diff: DeviceDescriptorDiff = this._diff(this.current, this.upcoming);
        this.current = this.upcoming;

        if (diff.didUpdate && this.listening) {
            diff.connected.forEach((d: DeviceDescriptor) => {
                this.emit(DEVICE.CONNECT, d);
            });
            diff.disconnected.forEach((d: DeviceDescriptor) => {
                this.emit(DEVICE.DISCONNECT, d);
            });
            diff.acquired.forEach((d: DeviceDescriptor) => {
                this.emit(DEVICE.ACQUIRED, d);
            });
            diff.released.forEach((d: DeviceDescriptor) => {
                this.emit(DEVICE.RELEASED, d);
            });
            diff.changedSessions.forEach((d: DeviceDescriptor) => {
                this.emit(DEVICE.CHANGED, d);
            });
            this.emit(TRANSPORT.UPDATE, diff);
        }
    }
}
