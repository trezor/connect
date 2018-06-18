/* @flow */
'use strict';

import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';
import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';
import type { MethodParams, MethodCallbacks } from 'flowtype/method';
import type { DefaultMessageResponse, MessageResponse } from '../../device/DeviceCommands';

import Device from '../../device/Device';
import type { UiPromiseResponse, CoreMessage } from 'flowtype';

type Params = {
    path: Array<number>;
    key: string;
    value: string;
    encrypt: boolean;
    askOnEncrypt: boolean;
    askOnDecrypt: boolean;
    iv: string;
}

export default class CipherKeyValue extends AbstractMethod {

    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = true; // this.useUi = payload.askOnEncrypt || payload.askOnDecrypt;
        this.info = 'Cypher key value';

        const payload: any = message.payload;

        if (!payload.hasOwnProperty('path')) {
            throw new Error('Parameter "path" is missing');
        } else {
            payload.path = validatePath(payload.path);
        }

        if (payload.hasOwnProperty('key') && typeof payload.key !== 'string') {
            throw new Error('Parameter "key" has invalid type. String expected.');
        }

        if (payload.hasOwnProperty('value') && typeof payload.value !== 'string') {
            throw new Error('Parameter "value" has invalid type. String expected.');
        }

        if (payload.hasOwnProperty('encrypt') && typeof payload.encrypt !== 'boolean') {
            throw new Error('Parameter "encrypt" has invalid type. Boolean expected.');
        }

        if (payload.hasOwnProperty('askOnEncrypt') && typeof payload.askOnDecrypt !== 'boolean') {
            throw new Error('Parameter "askOnEncrypt" has invalid type. Boolean expected.');
        }

        if (payload.hasOwnProperty('askOnDecrypt') && typeof payload.askOnDecrypt !== 'boolean') {
            throw new Error('Parameter "askOnDecrypt" has invalid type. Boolean expected.');
        }

        if (payload.hasOwnProperty('iv') && typeof payload.iv !== 'string') {
            throw new Error('Parameter "iv" has invalid type. String expected.');
        }

        this.params = {
            path: payload.path,
            key: payload.key,
            value: payload.value,
            encrypt: payload.encrypt,
            askOnEncrypt: payload.askOnEncrypt,
            askOnDecrypt: payload.askOnDecrypt,
            iv: payload.iv
        }
    }

    async run(): Promise<Object> {
        const response: MessageResponse<{value: string}> = await this.device.getCommands().cipherKeyValue(
            this.params.path,
            this.params.key,
            this.params.value,
            this.params.encrypt,
            this.params.askOnEncrypt,
            this.params.askOnDecrypt,
            this.params.iv
        );

        return {
            value: response.message.value
        }
    }
}
