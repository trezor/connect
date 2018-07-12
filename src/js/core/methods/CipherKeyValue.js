/* @flow */
'use strict';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import type { DefaultMessageResponse, MessageResponse } from '../../device/DeviceCommands';

import Device from '../../device/Device';
import type { UiPromiseResponse } from 'flowtype';
import type { CoreMessage } from '../../types';

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
        // this.useUi = payload.askOnEncrypt || payload.askOnDecrypt;
        this.info = 'Cypher key value';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(message.payload, [
            { name: 'path', obligatory: true },
            { name: 'key', type: 'string' },
            { name: 'value', type: 'string' },
            { name: 'encrypt', type: 'boolean' },
            { name: 'askOnEncrypt', type: 'boolean' },
            { name: 'askOnDecrypt', type: 'boolean' },
            { name: 'iv', type: 'string' },
        ]);

        const path: Array<number> = validatePath(payload.path);

        this.params = {
            path,
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
