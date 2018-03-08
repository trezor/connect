/* @flow */
'use strict';

import { checkPermissions } from './permissions';
import { UiMessage } from '../CoreMessage';
import type { MethodParams, MethodCallbacks } from './parameters';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    // wait for popup window
    await callbacks.getPopupPromise().promise;

    // request account selection view
    callbacks.postMessage(new UiMessage('request_device'));

    const uiResp: UiPromiseResponse = await callbacks.createUiPromise('WEBUSB', callbacks.device).promise;

    return {};
};

const confirmation = async (params: MethodParams, callbacks: MethodCallbacks): Promise<boolean> => {
    // empty
    return true;
};

/**
 * Processing incoming message.
 * This method is async that's why it returns Promise but the real response is passed by postMessage(new ResponseMessage)
 * @param {Object} raw
 * @returns {MethodParams}
 */
const params = (raw: Object): MethodParams => {
    const permissions: Array<string> = checkPermissions(['write']);
    const requiredFirmware: string = '1.5.0';

    return {
        responseID: raw.id,
        name: 'requestDevice',
        useUi: true,
        useDevice: false,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation: null,
        method,
        input: {

        },
    };
};

export default {
    method,
    confirmation,
    params,
};
