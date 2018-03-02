/* @flow */
'use strict';

import { checkPermissions } from './permissions';
import type { MethodParams, MethodCallbacks } from './parameters';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    return {
        "foo": "bar"
    };
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
    const permissions: Array<string> = checkPermissions([]);
    const requiredFirmware: string = '1.5.0';

    return {
        responseID: raw.id,
        name: 'getFeatures',
        useUi: false,
        useDevice: true,
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
