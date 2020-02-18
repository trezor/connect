/* @flow */

// This file reads descriptor with very little logic, and sends it to layers above

import EventEmitter from 'events';
import * as TRANSPORT from '../constants/transport';
import * as DEVICE from '../constants/device';

import Log, { init as initLog } from '../utils/debug';
import DataManager from '../data/DataManager';
import { resolveAfter } from '../utils/promiseUtils';
import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';

export type DeviceDescriptorDiff = {
    didUpdate: boolean;
    connected: Array<DeviceDescriptor>;
    disconnected: Array<DeviceDescriptor>;
    changedSessions: Array<DeviceDescriptor>;
    acquired: Array<DeviceDescriptor>;
    released: Array<DeviceDescriptor>;
    descriptors: Array<DeviceDescriptor>;
};

// custom log
const logger: Log = initLog('DescriptorStream');

export default class DescriptorStream extends EventEmitter {
    // actual low-level transport, from trezor-link
    transport: Transport;

    // if the transport works
    listening: boolean = false;

    // if transport fetch API rejects (when computer goes to sleep)
    listenTimestamp: number = 0;

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
            this.listenTimestamp = new Date().getTime();
            descriptors = waitForEvent ? await this.transport.listen(current) : await this.transport.enumerate();
            if (this.listening && !waitForEvent) {
                // enumerate returns some value
                // TRANSPORT.START will be emitted from DeviceList after device will be available (either acquired or unacquired)
                if (descriptors.length > 0 && DataManager.getSettings('pendingTransportEvent')) {
                    this.emit(TRANSPORT.START_PENDING, descriptors.length);
                } else {
                    this.emit(TRANSPORT.START);
                }
            }
            if (!this.listening) return; // do not continue if stop() was called

            this.upcoming = descriptors;
            logger.debug('Listen result', descriptors);
            this._reportChanges();
            if (this.listening) this.listen(); // handlers might have called stop()
        } catch (error) {
            const time = new Date().getTime() - this.listenTimestamp;
            logger.debug('Listen error', 'timestamp', time, typeof error);

            if (time > 1100) {
                await resolveAfter(1000, null);
                if (this.listening) this.listen();
            } else {
                logger.log('Transport error');
                this.emit(TRANSPORT.ERROR, error);
            }
        }
    }

    async enumerate(): Promise<void> {
        if (!this.listening) return;
        try {
            this.upcoming = await this.transport.enumerate();
            this._reportChanges();
        } catch (error) {
            // empty
        }
    }

    stop(): void {
        this.listening = false;
    }

    _diff(currentN: ?Array<DeviceDescriptor>, descriptors: Array<DeviceDescriptor>): DeviceDescriptorDiff {
        const current = currentN || [];
        const connected = descriptors.filter(d => {
            return current.find(x => {
                return x.path === d.path;
            }) === undefined;
        });
        const disconnected = current.filter(d => {
            return descriptors.find(x => {
                return x.path === d.path;
            }) === undefined;
        });
        const changedSessions = descriptors.filter(d => {
            const currentDescriptor = current.find(x => {
                return x.path === d.path;
            });
            if (currentDescriptor) {
                // return currentDescriptor.debug ? (currentDescriptor.debugSession !== d.debugSession) : (currentDescriptor.session !== d.session);
                return currentDescriptor.session !== d.session;
            } else {
                return false;
            }
        });
        const acquired = changedSessions.filter(d => {
            return typeof d.session === 'string';
        });
        const released = changedSessions.filter(d => {
            // const session = descriptor.debug ? descriptor.debugSession : descriptor.session;
            return typeof d.session !== 'string';
        });

        const changedDebugSessions = descriptors.filter(d => {
            const currentDescriptor = current.find(x => {
                return x.path === d.path;
            });
            if (currentDescriptor) {
                return currentDescriptor.debugSession !== d.debugSession;
            } else {
                return false;
            }
        });
        const debugAcquired = changedSessions.filter(d => {
            return typeof d.debugSession === 'string';
        });
        const debugReleased = changedSessions.filter(d => {
            return typeof d.debugSession !== 'string';
        });

        const didUpdate = (connected.length + disconnected.length + changedSessions.length + changedDebugSessions.length) > 0;

        return {
            connected,
            disconnected,
            changedSessions,
            acquired,
            released,
            changedDebugSessions,
            debugAcquired,
            debugReleased,
            didUpdate,
            descriptors,
        };
    }

    _reportChanges(): void {
        const diff = this._diff(this.current, this.upcoming);
        this.current = this.upcoming;

        if (diff.didUpdate && this.listening) {
            diff.connected.forEach(d => {
                this.emit(DEVICE.CONNECT, d);
            });
            diff.disconnected.forEach(d => {
                this.emit(DEVICE.DISCONNECT, d);
            });
            diff.acquired.forEach(d => {
                this.emit(DEVICE.ACQUIRED, d);
            });
            diff.released.forEach(d => {
                this.emit(DEVICE.RELEASED, d);
            });
            diff.changedSessions.forEach(d => {
                this.emit(DEVICE.CHANGED, d);
            });
            this.emit(TRANSPORT.UPDATE, diff);
        }
    }
}
