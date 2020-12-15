/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { stripHexPrefix, messageToHex } from '../../utils/formatUtils';
import type { CoreMessage } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class EthereumVerifyMessage extends AbstractMethod {
    params: $ElementType<MessageType, 'EthereumVerifyMessage'>;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Verify message';

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'address', type: 'string', obligatory: true },
            { name: 'signature', type: 'string', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const messageHex = payload.hex ? messageToHex(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
        this.params = {
            address: stripHexPrefix(payload.address),
            signature: stripHexPrefix(payload.signature),
            message: messageHex,
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('EthereumVerifyMessage', 'Success', this.params);
        return response.message;
    }
}
