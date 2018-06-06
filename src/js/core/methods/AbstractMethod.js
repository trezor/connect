/* @flow */
'use strict';

import Device from '../../device/Device';

import * as UI from '../../constants/ui';
import * as DEVICE from '../../constants/device';
import { UiMessage, DeviceMessage } from '../CoreMessage';
import type { Deferred, UiPromiseResponse, CoreMessage } from 'flowtype';

import { load as loadStorage, save as saveStorage, PERMISSIONS_KEY } from '../../iframe/storage';
import { crypto } from 'bitcoinjs-lib-zcash';
import DataManager from '../../data/DataManager';


export interface MethodInterface {
    +responseID: number;
    +device: Device;
}

export default class AbstractMethod implements MethodInterface {

    //+root: AbstractMethod;
    responseID: number;
    device: Device;
    devicePath: ?string;
    deviceInstance: number;
    deviceState: ?string;
    expectedDeviceState: boolean;
    keepSession: boolean;
    overridePreviousCall: boolean;
    overridden: boolean;
    name: string; // method name
    useUi: boolean; // should use popup?
    useDevice: boolean; // use device
    useEmptyPassphrase: boolean;

    requiredFirmware: string;
    requiredPermissions: Array<string>;

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
        this.deviceState = payload.device ? payload.device.state : null; // expected state (call param). This is not current device state!
        this.expectedDeviceState = payload.device ? payload.device.hasOwnProperty('state') : false;
        this.keepSession = typeof payload.keepSession === 'boolean' ? payload.keepSession : false;
        this.overridePreviousCall =  typeof payload.override === 'boolean' ? payload.override : false;
        this.overridden = false;
        this.useEmptyPassphrase =  typeof payload.useEmptyPassphrase === 'boolean' ? payload.useEmptyPassphrase : false;
    }

    async run(): Promise<Object> {
        // to override
        return new Promise(r => r({}));
    }

    async requestPermissions(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // post to view
        this.postMessage(new UiMessage(UI.REQUEST_PERMISSION, this.requiredPermissions));
        // wait for response
        const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_PERMISSION, this.device).promise;

        const permissionsResponse: any = uiResp.payload;

        if (permissionsResponse.granted) {
            if (permissionsResponse.remember) {
                this.savePermissions();
                return true;
            }
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

    savePermissions() {
        let savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY);
        if (!savedPermissions || !Array.isArray(savedPermissions)) {
            savedPermissions = JSON.parse("[]");
        }

        let permissionsToSave: Array<Object> = this.requiredPermissions.map(p => {
            return {
                origin: DataManager.getSettings('origin'),
                type: p,
                device: this.device.features.device_id
            }
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

        saveStorage(PERMISSIONS_KEY, savedPermissions.concat(permissionsToSave));

        if (emitEvent) {
            this.postMessage(new DeviceMessage(DEVICE.CONNECT, this.device.toMessageObject()))
        }
    }

    __hash(permission: string): string {
        const host: string = DataManager.getSettings('origin');
        const secret: string = `${permission}#${this.device.features.device_id}#${host}`;
        const hash: Buffer = crypto.hash256(new Buffer(secret, 'binary'));
        return hash.toString('hex');
    }
}
