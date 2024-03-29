/* @flow */

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';
import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import type { MessageType, CipheredKeyValue } from '../../types/trezor/protobuf';

export default class CipherKeyValue extends AbstractMethod<'cipherKeyValue'> {
    params: $ElementType<MessageType, 'CipherKeyValue'>[] = [];

    hasBundle: boolean;

    init() {
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Cypher key value';
        this.useEmptyPassphrase = true;

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = !!this.payload.bundle;
        const payload = !this.payload.bundle
            ? { ...this.payload, bundle: [this.payload] }
            : this.payload;

        // validate bundle type
        validateParams(payload, [{ name: 'bundle', type: 'array' }]);

        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', required: true },
                { name: 'key', type: 'string' },
                { name: 'value', type: 'string' },
                { name: 'encrypt', type: 'boolean' },
                { name: 'askOnEncrypt', type: 'boolean' },
                { name: 'askOnDecrypt', type: 'boolean' },
                { name: 'iv', type: 'string' },
            ]);

            this.params.push({
                address_n: validatePath(batch.path),
                key: batch.key,
                value: batch.value instanceof Buffer ? batch.value.toString('hex') : batch.value,
                encrypt: batch.encrypt,
                ask_on_encrypt: batch.askOnEncrypt,
                ask_on_decrypt: batch.askOnDecrypt,
                iv: batch.iv instanceof Buffer ? batch.iv.toString('hex') : batch.iv,
            });
        });
    }

    async run() {
        const responses: CipheredKeyValue[] = [];
        const cmd = this.device.getCommands();
        for (let i = 0; i < this.params.length; i++) {
            const response = await cmd.typedCall(
                'CipherKeyValue',
                'CipheredKeyValue',
                this.params[i],
            );
            responses.push(response.message);

            if (this.hasBundle) {
                // send progress
                this.postMessage(
                    UiMessage(UI.BUNDLE_PROGRESS, {
                        progress: i,
                        response,
                    }),
                );
            }
        }
        return this.hasBundle ? responses : responses[0];
    }
}
