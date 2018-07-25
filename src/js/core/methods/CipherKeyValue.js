/* @flow */
'use strict';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';

import type { CoreMessage } from '../../types';
import type { CipheredKeyValue } from '../../types/trezor';

type Batch = {
    path: Array<number>,
    key: string,
    value: string,
    encrypt: boolean,
    askOnEncrypt: boolean,
    askOnDecrypt: boolean,
    iv: string,
}
type Params = {
    bundle: Array<Batch>,
    bundledResponse: boolean,
}

export default class CipherKeyValue extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        // this.useUi = payload.askOnEncrypt || payload.askOnDecrypt;
        this.info = 'Cypher key value';
        this.useEmptyPassphrase = true;

        const payload: Object = message.payload;
        let bundledResponse: boolean = true;
        // create a bundle with only one batch
        if (!payload.hasOwnProperty('bundle')) {
            payload.bundle = [{ ...payload }];
            bundledResponse = false;
        }

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
        ]);

        const bundle = [];
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

            bundle.push({
                path,
                key: batch.key,
                value: batch.value,
                encrypt: batch.encrypt,
                askOnEncrypt: batch.askOnEncrypt,
                askOnDecrypt: batch.askOnDecrypt,
                iv: batch.iv,
            });
        });

        this.params = {
            bundle,
            bundledResponse,
        };
    }

    async run(): Promise<CipheredKeyValue | Array<CipheredKeyValue>> {
        const responses: Array<CipheredKeyValue> = [];
        for (let i = 0; i < this.params.bundle.length; i++) {
            const batch = this.params.bundle[i];
            const response: CipheredKeyValue = await this.device.getCommands().cipherKeyValue(
                batch.path,
                batch.key,
                batch.value,
                batch.encrypt,
                batch.askOnEncrypt,
                batch.askOnDecrypt,
                batch.iv
            );
            responses.push(response);

            if (this.params.bundledResponse) {
                // send progress
                this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }
        }
        return this.params.bundledResponse ? responses : responses[0];
    }
}
