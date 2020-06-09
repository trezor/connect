/* @flow */

import EventEmitter from 'events';
import { TRANSPORT, DEVICE, ERRORS } from '../constants';
import DescriptorStream from './DescriptorStream';
import type { DeviceDescriptorDiff } from './DescriptorStream';
import Device from './Device';
import type { Device as DeviceTyped } from '../types';
import TrezorLink from 'trezor-link';
import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';
import DataManager from '../data/DataManager';
import { getBridgeInfo } from '../data/TransportInfo';
import Log, { init as initLog } from '../utils/debug';
import { resolveAfter } from '../utils/promiseUtils';

import { WebUsbPlugin, ReactNativeUsbPlugin } from '../env/node/workers';
const { BridgeV2, Fallback } = TrezorLink;

// custom log
const _log: Log = initLog('DeviceList');

// TODO: plugins are not typed in 'trezor-link'
type LowLevelPlugin = {
    name: 'WebUsbPlugin' | 'ReactNativePlugin';
    unreadableHidDeviceChange: {
        on: (event: string, fn: any) => void;
    };
    unreadableHidDevice: boolean; // not sure
}

export default class DeviceList extends EventEmitter {
    transport: Transport;
    transportPlugin: LowLevelPlugin | typeof undefined;
    stream: DescriptorStream;
    devices: {[path: string]: Device} = {};
    creatingDevicesDescriptors: {[k: string]: DeviceDescriptor} = {};

    defaultMessages: JSON;
    currentMessages: JSON;
    hasCustomMessages: boolean = false;
    transportStartPending: number = 0;
    penalizedDevices: {[deviceID: string]: number} = {};

    constructor() {
        super();

        const { debug, env, webusb } = DataManager.settings;
        _log.enabled = !!debug;

        const transports: Transport[] = [];

        if (env === 'react-native' && typeof ReactNativeUsbPlugin !== 'undefined') {
            transports.push(ReactNativeUsbPlugin());
        } else {
            const bridgeLatestVersion = getBridgeInfo().version.join('.');
            const bridge = new BridgeV2(null, null);
            bridge.setBridgeLatestVersion(bridgeLatestVersion);
            if (env === 'node' || env === 'electron') {
                BridgeV2.setFetch(fetch, true);
            }
            transports.push(bridge);
        }

        if (webusb && typeof WebUsbPlugin !== 'undefined') {
            transports.push(WebUsbPlugin());
        }

        this.transport = new Fallback(transports);
        this.defaultMessages = DataManager.getProtobufMessages();
        this.currentMessages = this.defaultMessages;
    }

    async init() {
        const { transport } = this;
        try {
            _log.debug('Initializing transports');
            await transport.init(_log.enabled);
            _log.debug('Configuring transports');
            await transport.configure(JSON.stringify(this.defaultMessages));
            _log.debug('Configuring transports done');

            const { activeName } = transport;
            if (activeName === 'LowlevelTransportWithSharedConnections') {
                // $FlowIssue "activeTransport" is not typed in trezor-link
                this.transportPlugin = transport.activeTransport.plugin;
            }

            await this._initStream();

            // listen for self emitted events and resolve pending transport event if needed
            this.on(DEVICE.CONNECT, this.resolveTransportEvent.bind(this));
            this.on(DEVICE.CONNECT_UNACQUIRED, this.resolveTransportEvent.bind(this));
        } catch (error) {
            this.emit(TRANSPORT.ERROR, error);
        }
    }

    async reconfigure(messages: JSON | number[], custom?: boolean) {
        if (Array.isArray(messages)) {
            messages = DataManager.getProtobufMessages(messages);
        }
        if (this.currentMessages === messages) return;
        try {
            await this.transport.configure(JSON.stringify(messages));
            this.currentMessages = messages;
            this.hasCustomMessages = typeof custom === 'boolean' ? custom : false;
        } catch (error) {
            throw ERRORS.TypedError('Transport_InvalidProtobuf', error.message);
        }
    }

    async restoreMessages() {
        if (!this.hasCustomMessages) return;
        try {
            await this.transport.configure(JSON.stringify(this.defaultMessages));
            this.hasCustomMessages = false;
        } catch (error) {
            throw ERRORS.TypedError('Transport_InvalidProtobuf', error.message);
        }
    }

    resolveTransportEvent() {
        this.transportStartPending--;
        if (this.transportStartPending === 0) {
            this.stream.emit(TRANSPORT.START);
        }
    }

    async waitForTransportFirstEvent() {
        await new Promise(resolve => {
            const handler = () => {
                this.removeListener(TRANSPORT.START, handler);
                this.removeListener(TRANSPORT.ERROR, handler);
                resolve();
            };
            this.on(TRANSPORT.START, handler);
            this.on(TRANSPORT.ERROR, handler);
        });
    }

    /**
     * Transport events handler
     * @param {Transport} transport
     * @memberof DeviceList
     */
    async _initStream() {
        const stream = new DescriptorStream(this.transport);

        stream.on(TRANSPORT.START_PENDING, (pending: number) => {
            this.transportStartPending = pending;
        });

        stream.on(TRANSPORT.START, () => {
            this.emit(TRANSPORT.START, this.getTransportInfo());
        });

        stream.on(TRANSPORT.UPDATE, (diff: DeviceDescriptorDiff) => {
            new DiffHandler(this, diff).handle();
        });

        stream.on(TRANSPORT.ERROR, (error: Error) => {
            this.emit(TRANSPORT.ERROR, error);
            stream.stop();
        });

        stream.listen();
        this.stream = stream;

        if (this.transportPlugin && this.transportPlugin.name === 'WebUsbPlugin') {
            const { unreadableHidDeviceChange } = this.transportPlugin;
            unreadableHidDeviceChange.on('change', async () => {
                if (this.transportPlugin && this.transportPlugin.unreadableHidDevice) {
                    const device = await this._createUnacquiredDevice({ path: DEVICE.UNREADABLE, session: null, debugSession: null, debug: false });
                    this.devices[DEVICE.UNREADABLE] = device;
                    this.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
                } else {
                    const device = this.devices[DEVICE.UNREADABLE];
                    delete this.devices[DEVICE.UNREADABLE];
                    this.emit(DEVICE.DISCONNECT, device.toMessageObject());
                }
            });
        }

        this.emit(TRANSPORT.STREAM, stream);
    }

    async _createAndSaveDevice(descriptor: DeviceDescriptor) {
        _log.debug('Creating Device', descriptor);
        await new CreateDeviceHandler(descriptor, this).handle();
    }

    async _createUnacquiredDevice(descriptor: DeviceDescriptor) {
        const currentDescriptor = (this.stream.current && this.stream.current.find(d => d.path === descriptor.path)) || descriptor;
        _log.debug('Creating Unacquired Device', currentDescriptor);

        const device = await Device.createUnacquired(this.transport, currentDescriptor);
        device.once(DEVICE.ACQUIRED, () => {
            this.emit(DEVICE.CONNECT, device.toMessageObject());
        });
        return device;
    }

    getDevice(path: string) {
        return this.devices[path];
    }

    getFirstDevicePath() {
        return this.asArray()[0].path;
    }

    asArray(): DeviceTyped[] {
        return this.allDevices().map(device => device.toMessageObject());
    }

    allDevices(): Device[] {
        return Object.keys(this.devices).map((key: string) => this.devices[key]);
    }

    length() {
        return this.asArray().length;
    }

    transportType() {
        const { transport, transportPlugin } = this;
        const { activeName } = transport;
        if (activeName === 'BridgeTransport') {
            return 'bridge';
        }
        if (transportPlugin) {
            return transportPlugin.name;
        }
        return transport.name;
    }

    getTransportInfo() {
        return {
            type: this.transportType(),
            version: this.transport.version,
            outdated: this.transport.isOutdated,
        };
    }

    onBeforeUnload() {
        if (this.stream) {
            this.stream.stop();
        }

        this.allDevices().forEach(device => device.onBeforeUnload());
    }

    disconnectDevices() {
        this.allDevices().forEach(device => {
            // device.disconnect();
            this.emit(DEVICE.DISCONNECT, device.toMessageObject());
        });
    }

    enumerate() {
        this.stream.enumerate();
        if (!this.stream.current) return;
        // update current values
        this.stream.current.forEach((descriptor) => {
            const path = descriptor.path.toString();
            const device = this.devices[path];
            if (device) {
                device.updateDescriptor(descriptor);
            }
        });
    }

    addAuthPenalty(device: Device) {
        if (!device.isInitialized() || device.isBootloader() || !device.features.device_id) return;
        const deviceID = device.features.device_id;
        const penalty = this.penalizedDevices[deviceID] ? this.penalizedDevices[deviceID] + 500 : 2000;
        this.penalizedDevices[deviceID] = Math.min(penalty, 5000);
    }

    getAuthPenalty() {
        const { penalizedDevices } = this;
        return Object.keys(penalizedDevices).reduce((penalty, key) => {
            return Math.max(penalty, penalizedDevices[key]);
        }, 0);
    }

    removeAuthPenalty(device: Device) {
        if (!device.isInitialized() || device.isBootloader() || !device.features.device_id) return;
        const deviceID = device.features.device_id;
        delete this.penalizedDevices[deviceID];
    }
}

/**
 * DeviceList initialization
 * returns instance of DeviceList
 * @returns {Promise<DeviceList>}
 */
export const getDeviceList = async () => {
    const list = new DeviceList();
    await list.init();
    return list;
};

// Helper class for creating new device
class CreateDeviceHandler {
    descriptor: DeviceDescriptor;
    list: DeviceList;
    path: string;

    constructor(descriptor: DeviceDescriptor, list: DeviceList) {
        this.descriptor = descriptor;
        this.list = list;
        this.path = descriptor.path.toString();
    }

    // main logic
    async handle() {
        // creatingDevicesDescriptors is needed, so that if *during* creating of Device,
        // other application acquires the device and changes the descriptor,
        // the new unacquired device has correct descriptor
        this.list.creatingDevicesDescriptors[this.path] = this.descriptor;

        try {
            // "regular" device creation
            await this._takeAndCreateDevice();
        } catch (error) {
            _log.debug('Cannot create device', error);

            if (error.code === 'Device_NotFound') {
                // do nothing
                // it's a race condition between "device_changed" and "device_disconnected"
            } else if (error.message === ERRORS.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE || error.toString() === ERRORS.WEBUSB_ERROR_MESSAGE) {
                this.list.enumerate();
                await this._handleUsedElsewhere();
            } else if (error.code === 'Device_InitializeFailed') {
                // firmware bug - device is in "show address" state which cannot be cancelled
                await this._handleUsedElsewhere();
            } else if (error.code === 'Device_UsedElsewhere') {
                // most common error - someone else took the device at the same time
                await this._handleUsedElsewhere();
            } else {
                await resolveAfter(501, null);
                await this.handle();
            }
        }
        delete this.list.creatingDevicesDescriptors[this.path];
    }

    async _takeAndCreateDevice(): Promise<void> {
        const device = await Device.fromDescriptor(this.list.transport, this.descriptor);
        this.list.devices[this.path] = device;
        await device.run();
        this.list.emit(DEVICE.CONNECT, device.toMessageObject());
    }

    async _handleUsedElsewhere() {
        const device = await this.list._createUnacquiredDevice(this.list.creatingDevicesDescriptors[this.path]);
        this.list.devices[this.path] = device;
        this.list.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
    }
}

// Helper class for actual logic of handling differences
class DiffHandler {
    list: DeviceList;
    diff: DeviceDescriptorDiff;

    constructor(list: DeviceList, diff: DeviceDescriptorDiff) {
        this.list = list;
        this.diff = diff;
    }

    handle() {
        _log.debug('Update DescriptorStream', this.diff);

        // note - this intentionally does not wait for connected devices
        // createDevice inside waits for the updateDescriptor event
        this._createConnectedDevices();
        this._createReleasedDevices();
        this._signalAcquiredDevices();

        this._updateDescriptors();
        this._emitEvents();
        this._disconnectDevices();
    }

    _updateDescriptors() {
        this.diff.descriptors.forEach((descriptor: DeviceDescriptor) => {
            const path: string = descriptor.path.toString();
            const device: Device = this.list.devices[path];
            if (device) {
                device.updateDescriptor(descriptor);
            }
        });
    }

    _emitEvents() {
        const events: Array<{d: Array<DeviceDescriptor>; e: string}> = [
            {
                d: this.diff.changedSessions,
                e: DEVICE.CHANGED,
            }, {
                d: this.diff.acquired,
                e: DEVICE.ACQUIRED,
            }, {
                d: this.diff.released,
                e: DEVICE.RELEASED,
            },
        ];

        events.forEach(({d, e}: {d: Array<DeviceDescriptor>; e: string}) => {
            d.forEach((descriptor: DeviceDescriptor) => {
                const path: string = descriptor.path.toString();
                const device: Device = this.list.devices[path];
                _log.debug('Event', e, device);
                if (device) {
                    this.list.emit(e, device.toMessageObject());
                }
            });
        });
    }

    // tries to read info about connected devices
    async _createConnectedDevices() {
        for (const descriptor of this.diff.connected) {
            const path: string = descriptor.path.toString();
            const priority: number = DataManager.getSettings('priority');
            const penalty = this.list.getAuthPenalty();
            _log.debug('Connected', priority, penalty, descriptor.session, this.list.devices);
            if (priority || penalty) {
                await resolveAfter(501 + penalty + 100 * priority, null);
            }
            if (descriptor.session == null) {
                await this.list._createAndSaveDevice(descriptor);
            } else {
                const device: Device = await this.list._createUnacquiredDevice(descriptor);
                this.list.devices[path] = device;
                this.list.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
            }
        }
    }

    _signalAcquiredDevices() {
        for (const descriptor of this.diff.acquired) {
            const path: string = descriptor.path.toString();
            if (this.list.creatingDevicesDescriptors[path]) {
                this.list.creatingDevicesDescriptors[path] = descriptor;
            }
        }
    }

    // tries acquire and read info about recently released devices
    async _createReleasedDevices() {
        for (const descriptor of this.diff.released) {
            const path: string = descriptor.path.toString();
            const device: Device = this.list.devices[path];
            if (device) {
                if (device.isUnacquired() && !device.isInconsistent()) {
                    // wait for publish changes
                    await resolveAfter(501, null);
                    _log.debug('Create device from unacquired', device);
                    await this.list._createAndSaveDevice(descriptor);
                }
            }
        }
    }

    _disconnectDevices() {
        for (const descriptor of this.diff.disconnected) {
            const path: string = descriptor.path.toString();
            const device: Device = this.list.devices[path];
            if (device != null) {
                device.disconnect();
                delete this.list.devices[path];
                this.list.emit(DEVICE.DISCONNECT, device.toMessageObject());
            }
        }
    }
}
