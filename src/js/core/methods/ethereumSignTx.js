/* @flow */
'use strict';

import { checkPermissions } from './permissions';
import type { MethodParams, MethodCallbacks } from './parameters';
import BitcoreBackend, { create as createBackend } from '../../backend/BitcoreBackend';
import { getCoinInfoByCurrency } from '../../backend/CoinInfo';
import type { CoinInfo } from '../../backend/CoinInfo';
import type { MessageResponse } from '../../device/DeviceCommands';
import type { EthereumSignature } from '../../device/helpers/ethereumSigntx';
import { validatePath } from '../../utils/pathUtils';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    const input: Object = params.input.raw;

    const signedtx: MessageResponse<EthereumSignature> = await callbacks.device.getCommands().ethereumSignTx(
        input.address_n,
        input.nonce,
        input.gas_price,
        input.gas_limit,
        input.to,
        input.value,
        input.data,
        input.chain_id
    );

    return {
        ...signedtx,
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
    const permissions: Array<string> = checkPermissions(['write']);
    const requiredFirmware: string = '1.5.0';

    if (raw.path) {
        // get xpub by path
        raw.address_n = validatePath(raw.path);
    }

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
            raw,
        },
    };
};

export default {
    method,
    confirmation,
    params,
};
