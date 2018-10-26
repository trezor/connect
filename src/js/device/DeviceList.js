/* @flow */
'use strict';

import EventEmitter from 'events';
import * as TRANSPORT from '../constants/transport';
import * as DEVICE from '../constants/device';
import * as ERROR from '../constants/errors';
import DescriptorStream from './DescriptorStream';
import type { DeviceDescriptorDiff } from './DescriptorStream';
// import Device from './Device';
import Device from './Device';
import type { Device as DeviceTyped } from '../types';
import TrezorLink from 'trezor-link';
import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';
import DataManager from '../data/DataManager';
import Log, { init as initLog } from '../utils/debug';
import { resolveAfter } from '../utils/promiseUtils';

/* $FlowIssue loader notation */
import SharedConnectionWorker from 'sharedworker-loader?name=js/shared-connection-worker.[hash].js!trezor-link/lib/lowlevel/sharedConnectionWorker';

const { BridgeV2, Lowlevel, WebUsb, Fallback, Parallel } = TrezorLink;

export type DeviceListOptions = {
    debug?: boolean,
    debugInfo?: boolean,
    transport?: Transport,
    nodeTransport?: Transport,
    configUrl?: string,
    config?: string,
    bridgeVersionUrl?: string,
    clearSession?: boolean,
    clearSessionTime?: number,
    rememberDevicePassphrase?: boolean,
};

// custom log
const _log: Log = initLog('DeviceList');

function sharedWorkerFactoryWrap() {
    if (typeof window.SharedWorker !== 'undefined') {
        return new SharedConnectionWorker();
    } else {
        return null;
    }
}

export default class DeviceList extends EventEmitter {
    options: DeviceListOptions;
    transport: Transport;
    stream: DescriptorStream;
    devices: {[k: string]: Device} = {};
    creatingDevicesDescriptors: {[k: string]: DeviceDescriptor} = {};

    defaultMessages: JSON;
    hasCustomMessages: boolean = false;
    transportStartPending: boolean;

    constructor(options: ?DeviceListOptions) {
        super();
        this.options = options || {};

        _log.enabled = DataManager.getSettings('debug');
        if (!this.options.transport) {
            const transportTypes: Array<Transport> = [
                new BridgeV2(null, DataManager.getConfig().resources.bridge),
            ];

            if (DataManager.getSettings('webusb')) {
                transportTypes.push(new Parallel({
                    webusb: {
                        transport: new Lowlevel(
                            new WebUsb(),
                            () => sharedWorkerFactoryWrap()
                        ),
                        mandatory: true,
                    },
                }));
            }
            this.options.transport = new Fallback(transportTypes);
        }
        if (this.options.debug === undefined) {
            this.options.debug = true; // DataManager.getDebugSettings('deviceList');
        }
    }

    async init(): Promise<void> {
        try {
            this.transport = await this._initTransport();
            await this._initStream();
            const webUsbPlugin = this.getWebUsbPlugin();
            if (webUsbPlugin) {
                webUsbPlugin.unreadableHidDeviceChange.on('change', async () => {
                    if (webUsbPlugin.unreadableHidDevice) {
                        const device = await this._createUnacquiredDevice({ path: DEVICE.UNREADABLE, session: null });
                        this.devices[DEVICE.UNREADABLE] = device;
                        this.emit(DEVICE.CONNECT_UNACQUIRED, device.toMessageObject());
                    } else {
                        const device = this.devices[DEVICE.UNREADABLE];
                        delete this.devices[DEVICE.UNREADABLE];
                        this.emit(DEVICE.DISCONNECT, device.toMessageObject());
                    }
                });
            }

            // listen for self emitted events and resolve pending transport event if needed
            this.on(DEVICE.CONNECT, this.resolveTransportEvent.bind(this));
            this.on(DEVICE.CONNECT_UNACQUIRED, this.resolveTransportEvent.bind(this));
        } catch (error) {
            this.emit(TRANSPORT.ERROR, error);
        }
    }

    async _initTransport(): Promise<Transport> {
        const transport = this.options.transport;
        if (!transport) throw ERROR.NO_TRANSPORT;
        _log.debug('Initializing transports');
        await transport.init(DataManager.getSettings('debug'));
        // await transport.init(false);
        _log.debug('Configuring transports');
        await this._configTransport(transport);
        _log.debug('Configuring transports done');
        return transport;
    }

    async _configTransport(transport: Transport): Promise<void> {
        try {
            this.defaultMessages = DataManager.getMessages();
            await transport.configure(JSON.stringify(this.defaultMessages));
        } catch (error) {
            throw ERROR.WRONG_TRANSPORT_CONFIG;
        }
    }

    async reconfigure(json?: JSON): Promise<void> {
        try {
            let config: string;
            if (!json) {
                if (!this.hasCustomMessages) {
                    return;
                }
                // back to default messages
                config = JSON.stringify(this.defaultMessages);
            } else {
                // custom messages as JSON
                config = JSON.stringify(json);
            }
            await this.transport.configure(config);
            this.hasCustomMessages = !!(json);
        } catch (error) {
            throw ERROR.WRONG_TRANSPORT_CONFIG;
        }
    }

    resolveTransportEvent(): void {
        if (this.transportStartPending) {
            this.transportStartPending = false;
            this.stream.emit(TRANSPORT.START);
        }
    }

    async waitForTransportFirstEvent(): Promise<void> {
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
    async _initStream(): Promise<void> {
        const stream: DescriptorStream = new DescriptorStream(this.transport);

        stream.on(TRANSPORT.START_PENDING, (): void => {
            this.transportStartPending = true;
        });

        stream.on(TRANSPORT.START, (): void => {
            this.emit(TRANSPORT.START, {
                type: this.transportType(),
                version: this.transportVersion(),
                outdated: this.transportOutdated(),
                bridge: DataManager.getLatestBridgeVersion(),
            });
        });

        stream.on(TRANSPORT.UPDATE, (diff: DeviceDescriptorDiff): void => {
            new DiffHandler(this, diff).handle();
        });

        stream.on(TRANSPORT.ERROR, (error: Error) => {
            this.emit(TRANSPORT.ERROR, error);
            stream.stop();
        });

        stream.listen();
        this.stream = stream;

        this.emit(TRANSPORT.STREAM, stream);
    }

    async _createAndSaveDevice(
        descriptor: DeviceDescriptor
    ): Promise<void> {
        _log.debug('Creating Device', descriptor);
        await new CreateDeviceHandler(descriptor, this).handle();
    }

    async _createUnacquiredDevice(
        descriptor: DeviceDescriptor
    ): Promise<Device> {
        const currentDescriptor = (this.stream.current && this.stream.current.find(d => d.path === descriptor.path)) || descriptor;
        _log.debug('Creating Unacquired Device', currentDescriptor);
        try {
            const device = await Device.createUnacquired(this.transport, currentDescriptor);
            device.once(DEVICE.ACQUIRED, () => {
                this.emit(DEVICE.CONNECT, device.toMessageObject());
            });
            return device;
        } catch (error) {
            throw error;
        }
    }

    getDevice(path: string): Device {
        return this.devices[path];
    }

    getFirstDevicePath(): string {
        // const first = this.asArray()[0];
        // return this.devices[first.path];
        // const arr: Array<Object> =
        return this.asArray()[0].path;
    }

    asArray(): Array<DeviceTyped> {
        const list: Array<DeviceTyped> = this.allDevices().map(device => device.toMessageObject());
        return list;
    }

    allDevices(): Array<Device> {
        return Object.keys(this.devices).map((key: string) => this.devices[key]);
    }

    length(): number {
        return this.asArray().length;
    }

    // for mytrezor - returns "bridge" or "extension", or something else :)
    transportType(): string {
        if (this.transport == null) {
            return '';
        }
        if (this.transport.activeName) {
            const activeName: any = this.transport.activeName;
            if (activeName === 'BridgeTransport') {
                return 'bridge';
            }
            if (activeName === 'ExtensionTransport') {
                return 'extension';
            }
            return activeName;
        }
        return this.transport.name;
    }

    transportVersion(): string {
        if (this.transport == null) {
            return '';
        }
        return this.transport.version;
    }

    transportOutdated(): boolean {
        if (this.transport == null) {
            return false;
        }
        if (this.transport.isOutdated) {
            // return true; temporary disabled
            // Issue: https://github.com/trezor/connect/issues/236
            return false;
        }
        return false;
    }

    getWebUsbPlugin(): any {
        try {
            const transport: ?Transport = this.transport;
            if (transport == null) {
                return null;
            }

            // $FlowIssue - this all is going around Flow :/
            const activeTransport = transport.activeTransport;
            if (activeTransport == null || activeTransport.name !== 'ParallelTransport') {
                return null;
            }
            const webusbTransport = activeTransport.workingTransports['webusb'];
            if (webusbTransport == null) {
                return null;
            }
            // one of the HID fallbacks are working -> do not display the message
            const hidTransport = activeTransport.workingTransports['hid'];
            if (hidTransport != null) {
                return null;
            }
            return webusbTransport.plugin;
        } catch (e) {
            return null;
        }
    }

    onBeforeUnload(clearSession?: ?boolean) {
        if (this.stream !== null) {
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
        this.stream.current.forEach((descriptor: DeviceDescriptor) => {
            const path: string = descriptor.path.toString();
            const device: Device = this.devices[path];
            if (device) {
                device.updateDescriptor(descriptor);
            }
        });
    }
}

/**
 * DeviceList initialization
 * returns instance of DeviceList
 * @returns {Promise<DeviceList>}
 */
export const getDeviceList = async (): Promise<DeviceList> => {
    const list = new DeviceList({
        rememberDevicePassphrase: true,
    });
    try {
        await list.init();
        return list;
    } catch (error) {
        throw error;
    }
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

            if (error.message.toLowerCase() === ERROR.DEVICE_NOT_FOUND.message.toLowerCase()) {
                // do nothing
                // it's a race condition between "device_changed" and "device_disconnected"
            } else if (error.message === ERROR.WRONG_PREVIOUS_SESSION_ERROR_MESSAGE || error.toString() === ERROR.WEBUSB_ERROR_MESSAGE) {
                this.list.enumerate();
                await this._handleUsedElsewhere();
            } else if (error.code === ERROR.INITIALIZATION_FAILED.code) {
                // firmware bug - device is in "show address" state which cannot be cancelled
                await this._handleUsedElsewhere();
            } else if (error.message === ERROR.DEVICE_USED_ELSEWHERE.message) {
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
        if (!DataManager.isExcludedDevice(this.path)) { await device.run(); }
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
        const events: Array<{d: Array<DeviceDescriptor>, e: string}> = [
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

        events.forEach(({d, e}: {d: Array<DeviceDescriptor>, e: string}) => {
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
            _log.debug('Connected', priority, descriptor.session, this.list.devices);
            if (priority) {
                await resolveAfter(501 + 100 * priority, null);
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
