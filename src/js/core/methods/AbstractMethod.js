/* @flow */
'use strict';

import Device from '../../device/Device';

import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';
import type { CoreMessage, UiPromiseResponse } from '../CoreMessage';
import type { Deferred } from '../../utils/deferred';

// import { checkPermissions, savePermissions } from './permissions';
import { load as loadStorage, save as saveStorage } from '../../iframe/storage';
import { crypto } from 'bitcoinjs-lib-zcash';
import DataManager from '../../data/DataManager';


export interface MethodInterface {
    +responseID: number;
    +device: Device;
}

const PERMISSIONS_KEY: string = 'trezorconnect_permissions';

export default class AbstractMethod implements MethodInterface {

    //+root: AbstractMethod;
    responseID: number;
    device: Device;
    devicePath: ?string;
    deviceInstance: number;
    deviceState: ?string;
    keepSession: boolean;
    overridePreviousCall: boolean;
    name: string; // method name
    useUi: boolean; // should use popup?
    useDevice: boolean; // use device
    useEmptyPassphrase: boolean;

    requiredFirmware: string;
    requiredPermissions: Array<string>;

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
        this.deviceState = payload.device ? payload.device.state : null;
        this.keepSession = typeof payload.keepSession === 'boolean' ? payload.keepSession : false;
        this.overridePreviousCall =  typeof payload.override === 'boolean' ? payload.override : false;
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

        const permissionsResponse: string = uiResp.payload;
        const permissionsGranted: boolean = (permissionsResponse === 'true');

        if (permissionsGranted) {
            this.savePermissions();
            return true;
        }

        return false;
    }

    checkPermissions(): void {
        const savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY);
        const notPermitted: Array<string> = [ ...this.requiredPermissions ];
        if (savedPermissions && Array.isArray(savedPermissions)) {
            let p: string;
            // clear not permitted from array
            notPermitted.splice(0, notPermitted.length);
            // filter only not permitted
            for (p of this.requiredPermissions) {
                const hash: string = this.__hash(p);
                if (savedPermissions.indexOf(hash) < 0) {
                    notPermitted.push(p);
                }
            }
        }
        this.requiredPermissions = notPermitted;
    }

    savePermissions(): void {
        const savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY);
        let perms: Array<string>;
        if (savedPermissions && Array.isArray(savedPermissions)) {
            // save unique permissions
            let p: string;
            for (p of this.requiredPermissions) {
                const hash: string = this.__hash(p);
                if (savedPermissions.indexOf(hash) < 0) {
                    savedPermissions.push(hash);
                }
            }
            saveStorage(PERMISSIONS_KEY, savedPermissions);
        } else {
            const hashed: Array<string> = this.requiredPermissions.map(p => this.__hash(p));
            saveStorage(PERMISSIONS_KEY, hashed);
        }
    }

    __hash(permission: string): string {
        const host: string = DataManager.getSettings('origin');
        const secret: string = `${permission}#${this.device.features.device_id}#${host}`;
        const hash: Buffer = crypto.hash256(new Buffer(secret, 'binary'));
        return hash.toString('hex');
    }
}
