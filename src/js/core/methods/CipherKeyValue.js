/* @flow */

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';

import type { CoreMessage } from '../../types';
import type { CipheredKeyValue } from '../../types/trezor/protobuf';

type Batch = {
    path: Array<number>;
    key: string;
    value: string;
    encrypt: boolean;
    askOnEncrypt: boolean;
    askOnDecrypt: boolean;
    iv: string;
}
type Params = Array<Batch>;

export default class CipherKeyValue extends AbstractMethod {
    params: Params;
    hasBundle: boolean;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Cypher key value';
        this.useEmptyPassphrase = true;

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = Object.prototype.hasOwnProperty.call(message.payload, 'bundle');
        const payload: Object = !this.hasBundle ? { ...message.payload, bundle: [ message.payload ] } : message.payload;

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

        this.params = bundle;
    }

    async run(): Promise<CipheredKeyValue | Array<CipheredKeyValue>> {
        const responses: Array<CipheredKeyValue> = [];
        for (let i = 0; i < this.params.length; i++) {
            const batch = this.params[i];
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

            if (this.hasBundle) {
                // send progress
                this.postMessage(UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }
        }
        return this.hasBundle ? responses : responses[0];
    }
}
