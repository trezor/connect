/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import type { CoreMessage } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class LiskVerifyMessage extends AbstractMethod {
    params: $ElementType<MessageType, 'LiskVerifyMessage'>;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Lisk'), this.firmwareRange);
        this.info = 'Verify Lisk message';

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'publicKey', type: 'string', obligatory: true },
            { name: 'signature', type: 'string', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
        ]);

        // TODO: check if message is already in hex format
        const messageHex = Buffer.from(payload.message, 'utf8').toString('hex');

        this.params = {
            public_key: payload.publicKey,
            signature: payload.signature,
            message: messageHex,
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('LiskVerifyMessage', 'Success', this.params);
        return response.message;
    }
}
