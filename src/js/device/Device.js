/* @flow */
'use strict';

import EventEmitter from 'events';
import semvercmp from 'semver-compare';
import DeviceCommands from './DeviceCommands';

import type { Features } from './trezorTypes';
import type { Transport, TrezorDeviceInfoWithSession as DeviceDescriptor } from 'trezor-link';

import * as DEVICE from '../constants/device';
import * as ERROR from '../constants/errors';
import { create as createDeferred } from '../utils/deferred';
import type { Deferred } from '../utils/deferred';

import Log, { init as initLog } from '../utils/debug';

const FEATURES_LIFETIME: number = 10 * 60 * 1000; // 10 minutes

// custom log
const _log: Log = initLog('Device', true);

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
    features: Features;
    featuresNeedsReload: boolean = false;

    deferredActions: { [key: string]: Deferred<void> } = {};
    runPromise: ?Deferred<void>;

    loaded: boolean = false;
    inconsistent: boolean = false;
    firstRunPromise: Deferred<boolean>;

    activitySessionID: string;

    featuresTimestamp: number = 0;

    commands: DeviceCommands;

    // cachedPassphrase: ?string;
    cachedPassphrase: Array<?string> = [];

    keepSession: boolean = false;

    instance: number = 0;

    constructor(transport: Transport, descriptor: DeviceDescriptor) {
        super();

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

        const sessionID: string = await this.transport.acquire({
            path: this.originalDescriptor.path,
            previous: this.originalDescriptor.session,
            checkPrevious: true,
        });
        this.activitySessionID = sessionID;
        if (this.commands) {
            this.commands.dispose();
        }
        this.commands = new DeviceCommands(this, this.transport, sessionID);

        // future defer for trezor-link release event
        this.deferredActions[ DEVICE.RELEASE ] = createDeferred();
    }

    async release(): Promise<void> {
        if (this.isUsedHere() && !this.keepSession) {
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

    async run(
        fn?: () => Promise<void>,
        options?: RunOptions
    ): Promise<void> {
        if (this.runPromise) {
            // TODO: check if this method is called twice
            // wait or return nothing?
            _log.debug('++++++Wait for prev');
            // await this.runPromise.promise;
            _log.debug('TODO: is this will be called?');
            // throw new Error('Call in progress');
            throw ERROR.DEVICE_CALL_IN_PROGRESS;
        }

        options = parseRunOptions(options);

        this.runPromise = createDeferred(this._runInner.bind(this, fn, options));
        return this.runPromise.promise;
    }

    async override(error: Error): Promise<void> {
        if (this.runPromise) {
            this.runPromise.reject(error);
            this.runPromise = null;
        }

        if (this.deferredActions[ DEVICE.RELEASE ]) { await this.deferredActions[ DEVICE.RELEASE ].promise; }
    }

    interruptionFromUser(error: Error): void {
        _log.debug('+++++interruptionFromUser');
        if (this.runPromise) {
            // reject inner defer
            this.runPromise.reject(error);
            this.runPromise = null;

            // release device
            if (this.deferredActions[ DEVICE.RELEASE ]) {
                this.release();
            }
        }

        if (this.commands) {
            this.commands.dispose();
        }
    }

    interruptionFromOutside(): void {
        _log.debug('+++++interruptionFromOutside');
        if (this.runPromise) {
            this.runPromise.reject(ERROR.DEVICE_USED_ELSEWHERE);
            this.runPromise = null;
        }

        if (this.commands) {
            this.commands.dispose();
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
                await this.init();
            } catch (error) {
                this.inconsistent = true;
                await this.deferredActions[ DEVICE.ACQUIRE ].promise;
                this.runPromise = null;
                return Promise.reject(ERROR.INITIALIZATION_FAILED);
            }
        }

        // if keepSession is set do not release device
        // until method with keepSession: false will be called
        if (options.keepSession) {
            this.keepSession = true;
        }

        // try to cancel popup request, maybe it's not too late...
        if (this.isAuthenticated()) {
            this.emit(DEVICE.AUTHENTICATED);
        }

        // wait for event from trezor-link
        await this.deferredActions[ DEVICE.ACQUIRE ].promise;

        // call inner function
        if (fn) {
            await fn();
        }

        // reload features
        if (this.features && !this.features.bootloader_mode && this.features.initialized) { await this.getFeatures(); }

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
        this.instance = instance;
    }

    getInstance(): number {
        return this.instance;
    }

    setPassphrase(pass: ?string): void {
        this.cachedPassphrase[ this.instance ] = pass;
    }

    getPassphrase(): ?string {
        return this.cachedPassphrase[ this.instance ];
    }

    clearPassphrase(): void {
        this.cachedPassphrase[ this.instance ] = null;
        this.keepSession = false;
    }

    async init(): Promise<void> {
        const { message } : { message: Features } = await this.commands.initialize();
        this.features = message;
        this.featuresNeedsReload = false;
        this.featuresTimestamp = new Date().getTime();
    }

    async getFeatures(): Promise<void> {
        // const { message } : { message: Features } = await this.typedCall('GetFeatures', 'Features');
        const { message } : { message: Features } = await this.commands.typedCall('GetFeatures', 'Features', {});
        this.features = message;
    }

    getState(): ?string {
        return this.features ? this.features.state : null;
        // return null;
    }

    async _reloadFeatures(): Promise<void> {
        if (this.atLeast('1.3.3')) {
            await this.getFeatures();
        } else {
            await this.init();
        }
    }

    isUnacquired(): boolean {
        return this.features === undefined;
    }

    async updateDescriptor(descriptor: DeviceDescriptor): Promise<void> {
        _log.debug('updateDescriptor', 'currentSession', this.originalDescriptor.session, 'upcoming', descriptor.session, 'lastUsedID', this.activitySessionID);

        if (descriptor.session === null) {
            // released
            if (this.originalDescriptor.session === this.activitySessionID) {
                // by myself
                _log.debug('RELEASED BY MYSELF');
                if (this.deferredActions[ DEVICE.RELEASE ]) {
                    this.deferredActions[ DEVICE.RELEASE ].resolve();
                    delete this.deferredActions[ DEVICE.RELEASE ];
                }
            } else {
                // by other application
                _log.debug('RELEASED BY OTHER APP');
                this.featuresNeedsReload = true;
            }
            this.keepSession = false;
        } else {
            // acquired
            // TODO: Case where listen event will dispatch before this.transport.acquire (this.acquire) return ID
            if (descriptor.session === this.activitySessionID) {
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
        this.originalDescriptor = descriptor;
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
        return this.features.bootloader_mode;
    }

    isInitialized(): boolean {
        return this.features.initialized;
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

    atLeast(version: string): boolean {
        return semvercmp(this.getVersion(), version) >= 0;
    }

    getCoin(name: string): Object {
        const coins = this.features.coins;

        for (let i = 0; i < coins.length; i++) {
            if (coins[i].coin_name === name) {
                return coins[i];
            }
        }
        throw new Error('Device does not support given coin type');
    }

    isUsed(): boolean {
        return this.originalDescriptor.session != null;
    }

    isUsedHere(): boolean {
        return this.originalDescriptor.session != null && this.originalDescriptor.session === this.activitySessionID;
    }

    isUsedElsewhere(): boolean {
        return this.isUsed() && !(this.isUsedHere());
    }

    isRunning(): boolean {
        return !!(this.runPromise);
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

    isAuthenticated(useEmptyPassphrase: boolean = false): boolean {
        if (this.isUnacquired() || this.isUsedElsewhere() || this.featuresNeedsReload) return false;
        if (new Date().getTime() - this.featuresTimestamp > FEATURES_LIFETIME) return false;

        if (this.features.bootloader_mode || !this.features.initialized) return false;

        const pin: boolean = this.features.pin_protection ? this.features.pin_cached : true;
        let pass: boolean = this.features.passphrase_protection ? this.features.passphrase_cached : true;
        if (typeof this.cachedPassphrase[ this.instance ] === 'string') pass = true;
        if (useEmptyPassphrase) pass = true;
        _log.debug('isAuthenticated', pin, pass, this.cachedPassphrase);
        return (pin && pass);
    }

    onBeforeUnload() {
        if (this.isUsedHere()) {
            try {
                this.transport.release(this.activitySessionID, true);
            } catch (err) {
                // empty
            }
        }
        // await this.transport.release(this.activitySessionID);
    }

    // simplified object to pass via postMessage
    toMessageObject(): DeviceDescription {
        const defaultLabel: string = 'My TREZOR';
        if (this.isUnacquired()) {
            return {
                path: this.originalDescriptor.path,
                label: defaultLabel,
                isUsedElsewhere: this.isUsedElsewhere(),
                featuresNeedsReload: this.featuresNeedsReload,
                unacquired: true,
                features: this.features,
            };
        } else {
            const label = this.features.label === '' || this.features.label === null ? defaultLabel : this.features.label;
            return {
                path: this.originalDescriptor.path,
                label: label,
                isUsedElsewhere: this.isUsedElsewhere(),
                featuresNeedsReload: this.featuresNeedsReload,
                features: this.features,
            };
        }
    }
}

export type DeviceDescription = {
    path: string,
    label: string,
    isUsedElsewhere: boolean,
    featuresNeedsReload: boolean,
    unacquired?: boolean,
}
