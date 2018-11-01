/* @flow */
'use strict';

import EventEmitter from 'events';
import semvercmp from 'semver-compare';
import DeviceCommands from './DeviceCommands';

import type { Device as DeviceTyped, DeviceFirmwareStatus, Features, Deferred } from '../types';
import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';

import * as UI from '../constants/ui';
import * as DEVICE from '../constants/device';
import * as ERROR from '../constants/errors';
import { create as createDeferred } from '../utils/deferred';
import DataManager from '../data/DataManager';
import { checkFirmware } from '../data/FirmwareInfo';
import Log, { init as initLog } from '../utils/debug';

// custom log
const _log: Log = initLog('Device');

export type RunOptions = {

    // skipFinalReload - normally, after action, features are reloaded again
    //                   because some actions modify the features
    //                   but sometimes, you don't need that and can skip that
    skipFinalReload?: boolean,
    // waiting - if waiting and someone else holds the session, it waits until it's free
    //          and if it fails on acquire (because of more tabs acquiring simultaneously),
    //          it tries repeatedly
    waiting?: boolean,
    onlyOneActivity?: boolean,

    // cancel popup request when we are sure that there is no need to authenticate
    // Method gets called after run() fetch new Features but before trezor-link dispatch "acquire" event
    cancelPopupRequest?: Function,

    keepSession?: boolean,
    useEmptyPassphrase?: boolean,
}

const parseRunOptions = (options?: RunOptions): RunOptions => {
    if (!options) options = {};
    return options;
};

/**
 *
 *
 * @export
 * @class Device
 * @extends {EventEmitter}
 */
export default class Device extends EventEmitter {
    transport: Transport;
    originalDescriptor: DeviceDescriptor;

    firmwareStatus: DeviceFirmwareStatus;
    features: Features;
    featuresNeedsReload: boolean = false;

    deferredActions: { [key: string]: Deferred<void> } = {};
    runPromise: ?Deferred<void>;

    loaded: boolean = false;
    inconsistent: boolean = false;
    firstRunPromise: Deferred<boolean>;

    activitySessionID: ?string;

    featuresTimestamp: number = 0;

    commands: DeviceCommands;

    // cachedPassphrase: ?string;
    cachedPassphrase: Array<?string> = [];

    keepSession: boolean = false;

    instance: number = 0;

    state: ?string;
    expectedState: ?string;
    temporaryState: ?string;

    constructor(transport: Transport, descriptor: DeviceDescriptor) {
        super();

        _log.enabled = DataManager.getSettings('debug');

        // === immutable properties
        this.transport = transport;
        this.originalDescriptor = descriptor;

        // this will be released after first run
        this.firstRunPromise = createDeferred();
    }

    static async fromDescriptor(
        transport: Transport,
        originalDescriptor: DeviceDescriptor
    ): Promise<Device> {
        const descriptor = { ...originalDescriptor, session: null };
        try {
            const device: Device = new Device(transport, descriptor);
            return device;
        } catch (error) {
            _log.error('Device.fromDescriptor', error);
            throw error;
        }
    }

    static createUnacquired(
        transport: Transport,
        descriptor: DeviceDescriptor
    ): Device {
        return new Device(transport, descriptor);
    }

    async acquire(): Promise<void> {
        // will be resolved after trezor-link acquire event
        this.deferredActions[ DEVICE.ACQUIRE ] = createDeferred();
        this.deferredActions[ DEVICE.ACQUIRED ] = createDeferred();
        try {
            const sessionID: string = await this.transport.acquire({
                path: this.originalDescriptor.path,
                previous: this.originalDescriptor.session,
                checkPrevious: true,
            });
            _log.warn('Expected session id:', sessionID);
            this.activitySessionID = sessionID;
            this.deferredActions[ DEVICE.ACQUIRED ].resolve();
            delete this.deferredActions[ DEVICE.ACQUIRED ];

            if (this.commands) {
                this.commands.dispose();
            }
            this.commands = new DeviceCommands(this, this.transport, sessionID);

            // future defer for trezor-link release event
            this.deferredActions[ DEVICE.RELEASE ] = createDeferred();
        } catch (error) {
            this.deferredActions[ DEVICE.ACQUIRED ].resolve();
            delete this.deferredActions[ DEVICE.ACQUIRED ];
            if (this.runPromise) {
                this.runPromise.reject(error);
            } else {
                throw error;
            }
            this.runPromise = null;
        }
    }

    async release(): Promise<void> {
        if (this.isUsedHere() && !this.keepSession && this.activitySessionID) {
            if (this.commands) {
                this.commands.dispose();
            }
            try {
                await this.transport.release(this.activitySessionID, false);
            } catch (err) {
                // empty
            }
        }
    }

    cleanup(): void {
        this.release();
        this.removeAllListeners();
        // make sure that DEVICE_CALL_IN_PROGRESS will not be thrown
        this.runPromise = null;
    }

    async run(
        fn?: () => Promise<void>,
        options?: RunOptions
    ): Promise<void> {
        if (this.runPromise) {
            _log.debug('Previous call is still running');
            throw ERROR.DEVICE_CALL_IN_PROGRESS;
        }

        options = parseRunOptions(options);

        this.runPromise = createDeferred(this._runInner.bind(this, fn, options));
        return this.runPromise.promise;
    }

    async override(error: Error): Promise<void> {
        if (this.deferredActions[ DEVICE.ACQUIRE ]) { await this.deferredActions[ DEVICE.ACQUIRE ].promise; }

        if (this.runPromise) {
            this.runPromise.reject(error);
            this.runPromise = null;
        }

        if (!this.keepSession && this.deferredActions[ DEVICE.RELEASE ]) { await this.deferredActions[ DEVICE.RELEASE ].promise; }
    }

    interruptionFromUser(error: Error): void {
        _log.debug('+++++interruptionFromUser');
        if (this.commands) {
            this.commands.dispose();
        }
        if (this.runPromise) {
            // reject inner defer
            this.runPromise.reject(error);
            this.runPromise = null;

            // release device
            if (this.deferredActions[ DEVICE.RELEASE ]) {
                this.release();
            }
        }
    }

    interruptionFromOutside(): void {
        _log.debug('+++++interruptionFromOutside');
        if (this.commands) {
            this.commands.dispose();
        }
        if (this.runPromise) {
            this.runPromise.reject(ERROR.DEVICE_USED_ELSEWHERE);
            this.runPromise = null;
        }
    }

    async _runInner<X>(
        fn?: () => Promise<X>,
        options: RunOptions
    ): Promise<any> {
        if (!this.isUsedHere()) {
            // acquire session
            await this.acquire();

            // update features
            try {
                await this.initialize(!!options.useEmptyPassphrase);
            } catch (error) {
                this.inconsistent = true;
                await this.deferredActions[ DEVICE.ACQUIRE ].promise;
                this.runPromise = null;
                ERROR.INITIALIZATION_FAILED.message = `Initialize failed: ${ error.message }`;
                return Promise.reject(ERROR.INITIALIZATION_FAILED);
            }
        }

        // if keepSession is set do not release device
        // until method with keepSession: false will be called
        if (options.keepSession) {
            this.keepSession = true;
        }

        // wait for event from trezor-link
        await this.deferredActions[ DEVICE.ACQUIRE ].promise;

        // call inner function
        if (fn) {
            await fn();
        }

        // reload features
        if (this.features && !this.features.bootloader_mode && this.features.initialized) {
            await this.getFeatures();
        }

        // await resolveAfter(2000, null);
        if ((!this.keepSession && typeof options.keepSession !== 'boolean') || options.keepSession === false) {
            this.keepSession = false;
            await this.release();
            // wait for release event
            if (this.deferredActions[ DEVICE.RELEASE ]) await this.deferredActions[ DEVICE.RELEASE ].promise;
        }

        if (this.runPromise) { this.runPromise.resolve(); }
        this.runPromise = null;

        this.loaded = true;
        this.firstRunPromise.resolve(true);
    }

    getCommands(): DeviceCommands {
        return this.commands;
    }

    setInstance(instance: number): void {
        if (this.instance !== instance) {
            // if requested instance is different than current
            // and device wasn't released in previous call (example: interrupted discovery which set "keepSession" to true but never released)
            // clear "keepSession" and reset "activitySessionID" to ensure that "initialize" will be called
            if (this.keepSession) {
                this.activitySessionID = null;
                this.keepSession = false;
            }

            // T1: forget cached passphrase
            if (this.isT1()) {
                this.clearPassphrase();
            }
        }
        this.instance = instance;
    }

    getInstance(): number {
        return this.instance;
    }

    // set expected state from method parameter
    setExpectedState(state: ?string): void {
        if (!state) {
            this.setState(null); // T2 reset state
            this.setPassphrase(null); // T1 reset password
        }
        this.expectedState = state;
        // T2: set "temporaryState" the same as "expectedState", it may change if device will request for passphrase [after PassphraseStateRequest message]
        // this solves the issue with different instances but the same passphrases,
        // where device state passed in "initialize" is correct from device point of view
        // but "expectedState" and "temporaryState" are different strings
        if (!this.isT1()) {
            this.temporaryState = state;
        }
    }

    getExpectedState(): ?string {
        return this.expectedState;
    }

    setPassphrase(pass: ?string): void {
        if (this.isT1()) {
            this.cachedPassphrase[ this.instance ] = pass;
        }
    }

    getPassphrase(): ?string {
        return this.cachedPassphrase[ this.instance ];
    }

    clearPassphrase(): void {
        this.cachedPassphrase[ this.instance ] = null;
        this.keepSession = false;
    }

    async initialize(useEmptyPassphrase: boolean): Promise<void> {
        const { message } : { message: Features } = await this.commands.initialize(useEmptyPassphrase);
        this.features = message;
        this.featuresNeedsReload = false;
        this.featuresTimestamp = new Date().getTime();

        this.firmwareStatus = checkFirmware([ this.features.major_version, this.features.minor_version, this.features.patch_version ]);
    }

    async getFeatures(): Promise<void> {
        const { message } : { message: Features } = await this.commands.typedCall('GetFeatures', 'Features', {});
        this.features = message;
        this.firmwareStatus = checkFirmware([ this.features.major_version, this.features.minor_version, this.features.patch_version ]);
    }

    getState(): ?string {
        return this.state ? this.state : null;
    }

    setState(state: ?string): void {
        this.state = state;
    }

    setTemporaryState(state: ?string): void {
        this.temporaryState = state;
    }

    getTemporaryState(): ?string {
        return this.temporaryState;
    }

    isUnacquired(): boolean {
        return this.features === undefined;
    }

    async updateDescriptor(upcomingDescriptor: DeviceDescriptor): Promise<void> {
        _log.debug('updateDescriptor', 'currentSession', this.originalDescriptor.session, 'upcoming', upcomingDescriptor.session, 'lastUsedID', this.activitySessionID);

        if (!this.originalDescriptor.session && !upcomingDescriptor.session && !this.activitySessionID) {
            // no change
            return;
        }

        if (this.deferredActions[ DEVICE.ACQUIRED ]) { await this.deferredActions[ DEVICE.ACQUIRED ].promise; }

        if (upcomingDescriptor.session === null) {
            // corner-case: if device was unacquired but some call to this device was made
            // this will automatically change unacquired device to acquired (without deviceList)
            // emit ACQUIRED event to deviceList which will propagate DEVICE.CONNECT event
            if (this.listeners(DEVICE.ACQUIRED).length > 0) {
                this.emit(DEVICE.ACQUIRED);
            }
        }

        const methodStillRunning = this.commands && !this.commands.disposed;
        if (upcomingDescriptor.session === null && !methodStillRunning) {
            // released
            if (this.originalDescriptor.session === this.activitySessionID) {
                // by myself
                _log.debug('RELEASED BY MYSELF');
                if (this.deferredActions[ DEVICE.RELEASE ]) {
                    this.deferredActions[ DEVICE.RELEASE ].resolve();
                    delete this.deferredActions[ DEVICE.RELEASE ];
                }
                this.activitySessionID = null;
            } else {
                // by other application
                _log.debug('RELEASED BY OTHER APP');
                this.featuresNeedsReload = true;
            }
            this.keepSession = false;
        } else {
            // acquired
            // TODO: Case where listen event will dispatch before this.transport.acquire (this.acquire) return ID
            if (upcomingDescriptor.session === this.activitySessionID) {
                // by myself
                _log.debug('ACQUIRED BY MYSELF');
                if (this.deferredActions[ DEVICE.ACQUIRE ]) {
                    this.deferredActions[ DEVICE.ACQUIRE ].resolve();
                    // delete this.deferred[ DEVICE.ACQUIRE ];
                }
            } else {
                // by other application
                _log.debug('ACQUIRED BY OTHER');
                this.interruptionFromOutside();
            }
        }
        this.originalDescriptor = upcomingDescriptor;
    }

    disconnect(): void {
        // TODO: cleanup everything
        _log.debug('DISCONNECT CLEANUP!');
        // don't try to release
        delete this.deferredActions[ DEVICE.RELEASE ];

        this.interruptionFromUser(new Error('Device disconnected'));

        this.runPromise = null;
    }

    isBootloader(): boolean {
        return this.features.bootloader_mode && (typeof this.features.firmware_present === 'boolean' && this.features.firmware_present);
    }

    isInitialized(): boolean {
        return this.features.initialized;
    }

    isSeedless(): boolean {
        return this.features.no_backup;
    }

    isInconsistent(): boolean {
        return this.inconsistent;
    }

    getVersion(): string {
        return [
            this.features.major_version,
            this.features.minor_version,
            this.features.patch_version,
        ].join('.');
    }

    atLeast(versions: Array<string>): boolean {
        const modelVersion = versions[ this.features.major_version - 1 ];
        return semvercmp(this.getVersion(), modelVersion) >= 0;
    }

    isUsed(): boolean {
        return this.originalDescriptor.session !== null;
    }

    isUsedHere(): boolean {
        return this.originalDescriptor.session !== null && this.originalDescriptor.session === this.activitySessionID;
    }

    isUsedElsewhere(): boolean {
        return this.isUsed() && !(this.isUsedHere());
    }

    isRunning(): boolean {
        return !!this.runPromise;
    }

    isLoaded(): boolean {
        return this.loaded;
    }

    waitForFirstRun(): Promise<boolean> {
        return this.firstRunPromise.promise;
    }

    getDevicePath(): string {
        return this.originalDescriptor.path;
    }

    needAuthentication(): boolean {
        if (this.isUnacquired() || this.isUsedElsewhere() || this.featuresNeedsReload) return true;
        if (this.features.bootloader_mode || !this.features.initialized) return true;
        const pin: boolean = this.features.pin_protection ? this.features.pin_cached : true;
        const pass: boolean = this.features.passphrase_protection ? this.features.passphrase_cached : true;
        return pin && pass;
    }

    isT1(): boolean {
        return this.features ? this.features.major_version === 1 : false;
    }

    hasUnexpectedMode(requiredFirmware: Array<string>, allow: Array<string>): ?(typeof UI.BOOTLOADER | typeof UI.INITIALIZE | typeof UI.SEEDLESS | typeof UI.FIRMWARE | typeof UI.FIRMWARE_NOT_SUPPORTED) {
        if (this.features) {
            if (this.isBootloader() && allow.indexOf(UI.BOOTLOADER) < 0) {
                return UI.BOOTLOADER;
            }
            if (!this.isInitialized() && allow.indexOf(UI.INITIALIZE) < 0) {
                return UI.INITIALIZE;
            }
            if (this.isSeedless() && allow.indexOf(UI.SEEDLESS) < 0) {
                return UI.SEEDLESS;
            }
            if (requiredFirmware[ this.features.major_version - 1 ] === '0') {
                return UI.FIRMWARE_NOT_SUPPORTED;
            }
            if (this.firmwareStatus === 'required' || !this.atLeast(requiredFirmware)) {
                return UI.FIRMWARE;
            }
        }
        return null;
    }

    validateExpectedState(state: string): boolean {
        if (!this.isT1()) {
            const currentState: ?string = this.getExpectedState() || this.getState();
            if (!currentState) {
                this.setState(state);
                return true;
            } else if (currentState !== state) {
                return false;
            }
        } else if (this.getExpectedState() && this.getExpectedState() !== state) {
            return false;
        }
        return true;
    }

    onBeforeUnload() {
        if (this.isUsedHere() && this.activitySessionID) {
            try {
                this.transport.release(this.activitySessionID, true);
            } catch (err) {
                // empty
            }
        }
    }

    getMode() {
        if (this.features.bootloader_mode) return 'bootloader';
        if (!this.features.initialized) return 'initialize';
        if (this.features.no_backup) return 'seedless';
        return 'normal';
    }

    // simplified object to pass via postMessage
    toMessageObject(): DeviceTyped {
        if (this.originalDescriptor.path === DEVICE.UNREADABLE) {
            return {
                type: 'unreadable',
                path: this.originalDescriptor.path,
                label: 'Unreadable device',
            };
        } else if (this.isUnacquired()) {
            return {
                type: 'unacquired',
                path: this.originalDescriptor.path,
                label: 'Unacquired device',
            };
        } else {
            const defaultLabel: string = 'My Trezor';
            const label = this.features.label === '' || this.features.label === null ? defaultLabel : this.features.label;
            return {
                type: 'acquired',
                path: this.originalDescriptor.path,
                label: label,
                state: this.state,
                status: this.isUsedElsewhere() ? 'occupied' : this.featuresNeedsReload ? 'used' : 'available',
                mode: this.getMode(),
                firmware: this.firmwareStatus,
                features: this.features,
            };
        }
    }
}
