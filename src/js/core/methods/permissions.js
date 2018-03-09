/* @flow */
'use strict';

import type { MethodCallbacks } from './parameters';
import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';
import type { UiPromiseResponse } from '../CoreMessage';

import { load as loadStorage, save as saveStorage } from '../../iframe/storage';

const PERMISSIONS_KEY: string = 'trezorjs_permissions';

export const checkPermissions = (permissions: Array<string>): Array<string> => {
    // TODO: no permission needed while used as NPM
    const savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY);
    const notPermitted: Array<string> = [ ...permissions ];
    if (savedPermissions && Array.isArray(savedPermissions)) {
        let p: string;
        // clear not permitted array
        notPermitted.splice(0, notPermitted.length);
        // filter only not permitted
        for (p of permissions) {
            if (savedPermissions.indexOf(p) < 0) {
                notPermitted.push(p);
            }
        }
    }
    return notPermitted;
};

export const savePermissions = (permissions: Array<string>): void => {
    const savedPermissions: ?JSON = loadStorage(PERMISSIONS_KEY);
    if (savedPermissions && Array.isArray(savedPermissions)) {
        // save unique permissions
        let p: string;
        for (p of permissions) {
            if (savedPermissions.indexOf(p) < 0) {
                savedPermissions.push(p);
            }
        }
        saveStorage(PERMISSIONS_KEY, savedPermissions);
    } else {
        saveStorage(PERMISSIONS_KEY, permissions);
    }
};

export const requestPermissions = async (permissions: Array<string>, callbacks: MethodCallbacks): Promise<boolean> => {
    // wait for popup window
    await callbacks.getPopupPromise().promise;

    callbacks.postMessage(new UiMessage(UI.REQUEST_PERMISSION, permissions));
    // process response
    const uiResp: UiPromiseResponse = await callbacks.createUiPromise(UI.RECEIVE_PERMISSION, callbacks.device).promise;

    const permissionsResponse: string = uiResp.payload;
    const permissionsGranted: boolean = (permissionsResponse === 'true');
    if (permissionsGranted) {
        savePermissions(permissions);
        return true;
    }

    return false;
};

