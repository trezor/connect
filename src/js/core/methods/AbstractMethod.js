/* @flow */
'use strict';

import Device from '../../device/Device';

import * as UI from '../../constants/ui';
import * as DEVICE from '../../constants/device';
import { UiMessage, DeviceMessage } from '../../message/builder';
import type { UiPromiseResponse } from 'flowtype';
import type { Deferred, CoreMessage } from '../../types';

import { load as loadStorage, save as saveStorage, PERMISSIONS_KEY } from '../../iframe/storage';
import { crypto } from 'bitcoinjs-lib-zcash';
import DataManager from '../../data/DataManager';

export interface MethodInterface {
    +responseID: number,
    +device: Device,
}

export default class AbstractMethod implements MethodInterface {
    responseID: number;
    device: Device;
    devicePath: ?string;
    deviceInstance: number;
    deviceState: ?string;
    hasExpectedDeviceState: boolean;
    keepSession: boolean;
    overridePreviousCall: boolean;
    overridden: boolean;
    name: string; // method name
    info: string; // method info, displayed in popup info-panel
    useUi: boolean; // should use popup?
    useDevice: boolean; // use device
    useDeviceState: boolean; // should validate device state?
    useEmptyPassphrase: boolean;
    allowSeedlessDevice: boolean;

    requiredFirmware: Array<string>;
    requiredPermissions: Array<string>;
    allowDeviceMode: Array<string>; // used in device management (like ResetDevice allow !UI.INITIALIZED)

    +confirmation: () => Promise<boolean>;

    // // callbacks
    postMessage: (message: CoreMessage) => void;
    getPopupPromise: () => Deferred<void>;
    createUiPromise: (promiseId: string, device?: Device) => Deferred<UiPromiseResponse>;
    findUiPromise: (callId: number, promiseId: string) => ?Deferred<UiPromiseResponse>;
    removeUiPromise: (promise: Deferred<UiPromiseResponse>) => void;

    constructor(message: CoreMessage) {
        const payload: any = message.payload;
        this.name = payload.method;
        this.responseID = message.id || 0;
        this.devicePath = payload.device ? payload.device.path : null;
        this.deviceInstance = payload.device ? payload.device.instance : 0;
        // expected state from method parameter.
        // it could be null
        this.deviceState = payload.device ? payload.device.state : null;
        this.hasExpectedDeviceState = payload.device ? payload.device.hasOwnProperty('state') : false;
        this.keepSession = typeof payload.keepSession === 'boolean' ? payload.keepSession : false;
        this.overridePreviousCall = typeof payload.override === 'boolean' ? payload.override : false;
        this.overridden = false;
        this.useEmptyPassphrase = typeof payload.useEmptyPassphrase === 'boolean' ? payload.useEmptyPassphrase : false;
        this.allowSeedlessDevice = typeof payload.allowSeedlessDevice === 'boolean' ? payload.allowSeedlessDevice : false;
        this.allowDeviceMode = [];
        if (this.allowSeedlessDevice) {
            this.allowDeviceMode = [ UI.SEEDLESS ];
        }
        // default values for all methods
        this.requiredFirmware = ['1.0.0', '2.0.0'];
        this.useDevice = true;
        this.useDeviceState = true;
        this.useUi = true;
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
        this.postMessage(new UiMessage(UI.REQUEST_PERMISSION, {
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
            this.postMessage(new DeviceMessage(DEVICE.CONNECT, this.device.toMessageObject()));
        }
    }

    getCustomMessages(): ?JSON {
        return null;
    }

    __hash(permission: string): string {
        const host: string = DataManager.getSettings('origin');
        const secret: string = `${permission}#${this.device.features.device_id}#${host}`;
        const hash: Buffer = crypto.hash256(Buffer.from(secret, 'binary'));
        return hash.toString('hex');
    }

    dispose() {
        // to override
    }
}
