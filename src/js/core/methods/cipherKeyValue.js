/* @flow */
'use strict';

import { validatePath, getPathFromIndex } from '../../utils/pathUtils';
import { checkPermissions } from './permissions';
import type { MethodParams, MethodCallbacks } from './parameters';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    const input: Object = params.input;
    const node = await callbacks.device.getCommands().cipherKeyValue(input.path, input.key, input.value, input.encrypt, input.ask_on_encrypt, input.ask_on_decrypt, input.iv);
    return {
        resp: node
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

    if (!raw.hasOwnProperty('path')) {
        throw new Error('Parameter "path" is missing');
    } else {
        raw.path = validatePath(raw.path);
    }

    if (raw.hasOwnProperty('key') && typeof raw.key !== 'string') {
        throw new Error('Parameter "key" has invalid type. String expected.');
    }

    if (raw.hasOwnProperty('value') && typeof raw.value !== 'string') {
        throw new Error('Parameter "value" has invalid type. String expected.');
    }

    if (raw.hasOwnProperty('askOnEncrypt') && typeof raw.askOnDecrypt !== 'boolean') {
        throw new Error('Parameter "askOnEncrypt" has invalid type. Boolean expected.');
    }

    if (raw.hasOwnProperty('askOnDecrypt') && typeof raw.askOnDecrypt !== 'boolean') {
        throw new Error('Parameter "askOnDecrypt" has invalid type. Boolean expected.');
    }

    if (raw.hasOwnProperty('useEmptyPassphrase') && typeof raw.useEmptyPassphrase !== 'boolean') {
        throw new Error('Parameter "useEmptyPassphrase" has invalid type. Boolean expected.');
    }

    if (raw.hasOwnProperty('iv') && typeof raw.iv !== 'string') {
        throw new Error('Parameter "iv" has invalid type. String expected.');
    }

    const allowed = ['id', 'method', 'device', 'override', 'useEmptyPassphrase', 'path', 'key', 'value', 'encrypt', 'askOnEncrypt', 'askOnDecrypt', 'iv'];
    for (const [key, value] of Object.entries(raw)) {
        if (allowed.indexOf(key) < 0) {
            console.warn(`Unknown param "${key}"`);
        }
    }

    return {
        responseID: raw.id,
        name: 'cipherKeyValue',
        useUi: false,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation: null,
        method,
        useEmptyPassphrase: raw.useEmptyPassphrase,
        input: {
            path: raw.path,
            key: raw.key,
            value: raw.value,
            encrypt: raw.encrypt,
            ask_on_encrypt: raw.askOnEncrypt,
            ask_on_decrypt: raw.askOnDecrypt,
            iv: raw.iv
        },
    };
};

export default {
    method,
    confirmation,
    params,
};
