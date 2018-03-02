/* @flow */
'use strict';

import { checkPermissions } from './permissions';
import type { MethodParams, MethodCallbacks } from './parameters';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {

    const input: Object = params.input;

    const res: MessageResponse<EthereumSignature> = await callbacks.device.getCommands().ethereumGetAddress(
        input.address_n,
        input.showOnTrezor
    );
    return res;
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
    const permissions: Array<string> = checkPermissions(['read']);
    const requiredFirmware: string = '1.5.0';

    let showOnTrezor: boolean = true;
    if (typeof raw.showOnTrezor === 'boolean') {
        showOnTrezor = raw.showOnTrezor;
    }

    return {
        responseID: raw.id,
        name: 'ethereumGetAddress',
        useUi: showOnTrezor,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation: null,
        method,
        input: {
            address_n: raw.address_n,
            showOnTrezor
        },
    };
};

export default {
    method,
    confirmation,
    params,
};
