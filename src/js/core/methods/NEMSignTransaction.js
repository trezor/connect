/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/nemSignTx';

import type { NEMTransaction } from '../../types/networks/nem';
import type { CoreMessage } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class NEMSignTransaction extends AbstractMethod {
    params: $ElementType<MessageType, 'NEMSignTx'>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('NEM'), this.firmwareRange);
        this.info = 'Sign NEM transaction';

        const { payload } = message;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in nem-sdk format
        const transaction: NEMTransaction = payload.transaction;
        this.params = helper.createTx(transaction, path);
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('NEMSignTx', 'NEMSignedTx', this.params);
        return response.message;
    }
}
