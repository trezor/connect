/* @flow */
'use strict';

import { checkPermissions } from './permissions';
import type { MethodParams, MethodCallbacks } from './parameters';
import type { DefaultMessageResponse } from '../../device/DeviceCommands';
import { DeviceMessage } from '../CoreMessage';
import * as DEVICE from '../../constants/device';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    const input: Object = params.input;
    const resp: DefaultMessageResponse = await callbacks.device.getCommands().typedCall(input.type, input.resType, input.message);

    await callbacks.device.init();

    // post device changes
    // TODO: change event type to Device.CHANGED?
    callbacks.postMessage(new DeviceMessage(DEVICE.USED_ELSEWHERE, callbacks.device.toMessageObject()));

    return resp;
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
        name: 'custom',
        useUi: true,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation: null,
        method,
        input: {
            type: raw.type,
            resType: raw.resType,
            message: raw.message,
        },
    };
};

export default {
    method,
    confirmation,
    params,
};
