/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import { getLabel } from '../../utils/pathUtils';
import { messageToHex } from '../../utils/formatUtils';
import { ERRORS } from '../../constants';
import type { CoreMessage } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class VerifyMessage extends AbstractMethod {
    params: $ElementType<MessageType, 'VerifyMessage'>;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];
        this.info = 'Verify message';

        const { payload } = message;

        // validate incoming parameters for each batch
        validateParams(payload, [
            { name: 'address', type: 'string', obligatory: true },
            { name: 'signature', type: 'string', obligatory: true },
            { name: 'message', type: 'string', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'hex', type: 'boolean' },
        ]);

        const coinInfo = getBitcoinNetwork(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        } else {
            // check required firmware with coinInfo support
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
            this.info = getLabel('Verify #NETWORK message', coinInfo);
        }
        const messageHex = payload.hex ? messageToHex(payload.message) : Buffer.from(payload.message, 'utf8').toString('hex');
        const signatureHex = Buffer.from(payload.signature, 'base64').toString('hex');

        this.params = {
            address: payload.address,
            signature: signatureHex,
            message: messageHex,
            coin_name: coinInfo.name,
        };
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('VerifyMessage', 'Success', this.params);
        return response.message;
    }
}
