/* @flow */
'use strict';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';

import Device from '../../device/Device';
import type { UiPromiseResponse } from 'flowtype';
import type { CoreMessage } from '../../types';
import type { CipheredKeyValue } from '../../types/trezor';

type Params = {
    path: Array<number>;
    key: string;
    value: string;
    encrypt: boolean;
    askOnEncrypt: boolean;
    askOnDecrypt: boolean;
    iv: string;
}

type Response = {value: string};

export default class CipherKeyValue extends AbstractMethod {

    params: Array<Params>;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        // this.useUi = payload.askOnEncrypt || payload.askOnDecrypt;
        this.info = 'Cypher key value';

        const payload: Object = message.payload;
        // there is only one request
        // create a bundle with only one batch
        if (!payload.hasOwnProperty('bundle')) {
            payload.bundle = [{ ...payload }];
        }

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' }
        ]);

        this.params = [];
        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', obligatory: true },
                { name: 'key', type: 'string' },
                { name: 'value', type: 'string' },
                { name: 'encrypt', type: 'boolean' },
                { name: 'askOnEncrypt', type: 'boolean' },
                { name: 'askOnDecrypt', type: 'boolean' },
                { name: 'iv', type: 'string' },
            ]);

            const path: Array<number> = validatePath(batch.path);

            this.params.push({
                path,
                key: batch.key,
                value: batch.value,
                encrypt: batch.encrypt,
                askOnEncrypt: batch.askOnEncrypt,
                askOnDecrypt: batch.askOnDecrypt,
                iv: batch.iv
            });
        });
    }

    async run(): Promise<CipheredKeyValue | Array<CipheredKeyValue>> {
        const responses: Array<CipheredKeyValue> = [];
        for (let i = 0; i < this.params.length; i++) {
            const response: CipheredKeyValue = await this.device.getCommands().cipherKeyValue(
                this.params[i].path,
                this.params[i].key,
                this.params[i].value,
                this.params[i].encrypt,
                this.params[i].askOnEncrypt,
                this.params[i].askOnDecrypt,
                this.params[i].iv
            );
            responses.push(response);
        }
        return responses.length === 1 ? responses[0] : responses;
    }
}
