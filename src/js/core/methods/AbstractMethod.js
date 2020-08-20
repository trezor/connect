/* @flow */

import Device from '../../device/Device';
import DataManager from '../../data/DataManager';
import { UI, DEVICE, ERRORS, NETWORK } from '../../constants';
import { load as loadStorage, save as saveStorage, PERMISSIONS_KEY } from '../../storage';
import { versionCompare } from '../../utils/versionUtils';

import { UiMessage, DeviceMessage } from '../../message/builder';
import type { Deferred, CoreMessage, UiPromiseResponse, FirmwareRange, FirmwareException, ButtonRequestData } from '../../types';

export interface MethodInterface {
    +responseID: number;
    +device: Device;
}

export default class AbstractMethod implements MethodInterface {
    responseID: number;
    device: Device;
    devicePath: ?string;
    deviceInstance: number;
    deviceState: ?string;
    hasExpectedDeviceState: boolean;
    keepSession: boolean;
    skipFinalReload: boolean;
    skipFirmwareCheck: boolean;
    overridePreviousCall: boolean;
    overridden: boolean;
    name: string; // method name
    info: string; // method info, displayed in popup info-panel
    useUi: boolean; // should use popup?
    useDevice: boolean; // use device
    useDeviceState: boolean; // should validate device state?
    useEmptyPassphrase: boolean;
    allowSeedlessDevice: boolean;

    firmwareRange: FirmwareRange;
    requiredPermissions: Array<string>;
    allowDeviceMode: Array<string>; // used in device management (like ResetDevice allow !UI.INITIALIZED)
    requireDeviceMode: Array<string>;
    debugLink: boolean;
    network: string;

    +confirmation: () => Promise<boolean>;
    +noBackupConfirmation: () => Promise<boolean>;
    +getButtonRequestData: (code: string) => ?ButtonRequestData;

    // // callbacks
    postMessage: (message: CoreMessage) => void;
    getPopupPromise: () => Deferred<void>;
    createUiPromise: (promiseId: string, device?: Device) => Deferred<UiPromiseResponse>;
    findUiPromise: (callId: number, promiseId: string) => ?Deferred<UiPromiseResponse>;
    removeUiPromise: (promise: Deferred<UiPromiseResponse>) => void;

    constructor(message: CoreMessage) {
        const payload: Object = message.payload;
        this.name = payload.method;
        this.responseID = message.id || 0;
        this.devicePath = payload.device ? payload.device.path : null;
        this.deviceInstance = payload.device ? payload.device.instance : 0;
        // expected state from method parameter.
        // it could be null
        this.deviceState = payload.device ? payload.device.state : null;
        this.hasExpectedDeviceState = payload.device ? Object.prototype.hasOwnProperty.call(payload.device, 'state') : false;
        this.keepSession = typeof payload.keepSession === 'boolean' ? payload.keepSession : false;
        this.skipFinalReload = typeof payload.skipFinalReload === 'boolean' ? payload.skipFinalReload : false;
        this.skipFirmwareCheck = false;
        this.overridePreviousCall = typeof payload.override === 'boolean' ? payload.override : false;
        this.overridden = false;
        this.useEmptyPassphrase = typeof payload.useEmptyPassphrase === 'boolean' ? payload.useEmptyPassphrase : false;
        this.allowSeedlessDevice = typeof payload.allowSeedlessDevice === 'boolean' ? payload.allowSeedlessDevice : false;
        this.allowDeviceMode = [];
        this.requireDeviceMode = [];
        if (this.allowSeedlessDevice) {
            this.allowDeviceMode = [ UI.SEEDLESS ];
        }
        this.debugLink = false;
        // Determine the type based on the method name
        this.network = 'Bitcoin';
        Object.keys(NETWORK.TYPES).forEach(t => {
            if (this.name.startsWith(t)) {
                this.network = NETWORK.TYPES[t];
                return;
            }
        });
        // default values for all methods
        this.firmwareRange = {
            '1': { min: '1.0.0', max: '0' },
            '2': { min: '2.0.0', max: '0' },
        };
        this.requiredPermissions = [];
        this.useDevice = true;
        this.useDeviceState = true;
        this.useUi = true;
    }

    setDevice(device: Device) {
        this.device = device;
        this.devicePath = device.getDevicePath();
    }

    async run(): Promise<Object | Array<Object>> {
        // to override
        return new Promise(resolve => resolve({}));
    }

    async requestPermissions(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_PERMISSION, this.device);
        this.postMessage(UiMessage(UI.REQUEST_PERMISSION, {
            permissions: this.requiredPermissions,
            device: this.device.toMessageObject(),
        }));
        // wait for response
        const uiResp: UiPromiseResponse = await uiPromise.promise;

        const permissionsResponse: any = uiResp.payload;

        if (permissionsResponse.granted) {
            this.savePermissions(!(permissionsResponse.remember));
            return true;
        }
        return false;
    }

    checkPermissions(): void {
        const savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY);
        let notPermitted: Array<string> = [ ...this.requiredPermissions ];
        if (savedPermissions && Array.isArray(savedPermissions)) {
            // find permissions for this origin
            const originPermissions: Array<Object> = savedPermissions.filter(p => p.origin === DataManager.getSettings('origin'));
            if (originPermissions.length > 0) {
                // check if permission was granted
                notPermitted = notPermitted.filter(np => {
                    const granted = originPermissions.find(p => p.type === np && p.device === this.device.features.device_id);
                    return !granted;
                });
            }
        }
        this.requiredPermissions = notPermitted;
    }

    savePermissions(temporary: boolean = false) {
        let savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY, temporary);
        if (!savedPermissions || !Array.isArray(savedPermissions)) {
            savedPermissions = JSON.parse('[]');
        }

        let permissionsToSave: Array<Object> = this.requiredPermissions.map(p => {
            return {
                origin: DataManager.getSettings('origin'),
                type: p,
                device: this.device.features.device_id,
            };
        });

        // check if this will be first time granted permission to read this device
        // if so, emit "device_connect" event because this wasn't send before
        let emitEvent: boolean = false;
        if (this.requiredPermissions.indexOf('read') >= 0) {
            const wasAlreadyGranted = savedPermissions.filter(p => p.origin === DataManager.getSettings('origin') && p.type === 'read' && p.device === this.device.features.device_id);
            if (wasAlreadyGranted.length < 1) {
                emitEvent = true;
            }
        }

        // find permissions for this origin
        const originPermissions: Array<Object> = savedPermissions.filter(p => p.origin === DataManager.getSettings('origin'));
        if (originPermissions.length > 0) {
            permissionsToSave = permissionsToSave.filter(p2s => {
                const granted = originPermissions.find(p => p.type === p2s.type && p.device === p2s.device);
                return !granted;
            });
        }

        saveStorage(PERMISSIONS_KEY, savedPermissions.concat(permissionsToSave), temporary);

        if (emitEvent) {
            this.postMessage(DeviceMessage(DEVICE.CONNECT, this.device.toMessageObject()));
        }
    }

    async checkFirmwareRange(isUsingPopup: boolean): Promise<?$PropertyType<FirmwareException, 'type'>> {
        if (this.skipFirmwareCheck) {
            return null;
        }
        const device = this.device;
        if (!device.features) return null;
        const version = device.getVersion();
        const model = version[0];
        const range = this.firmwareRange[model];

        if (device.firmwareStatus === 'none') {
            return UI.FIRMWARE_NOT_INSTALLED;
        }
        if (range.min === '0') {
            return UI.FIRMWARE_NOT_SUPPORTED;
        }

        if (device.firmwareStatus === 'required' || versionCompare(version, range.min) < 0) {
            return UI.FIRMWARE_OLD;
        }

        if (range.max !== '0' && versionCompare(version, range.max) > 0) {
            if (isUsingPopup) {
                // wait for popup handshake
                await this.getPopupPromise().promise;
                // initialize user response promise
                const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, device);
                // show unexpected state information and wait for confirmation
                this.postMessage(UiMessage(UI.FIRMWARE_NOT_COMPATIBLE, device.toMessageObject()));

                const uiResp: UiPromiseResponse = await uiPromise.promise;
                if (!uiResp.payload) {
                    throw ERRORS.TypedError('Method_PermissionsNotGranted');
                }
            } else {
                return UI.FIRMWARE_NOT_COMPATIBLE;
            }
        }
        return null;
    }

    getCustomMessages(): ?JSON {
        return null;
    }

    dispose() {
        // to override
    }
}
