/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/tezosSignTx';

import type { CoreMessage } from '../../types';
import type { MessageType } from '../../types/trezor/protobuf';

export default class TezosSignTransaction extends AbstractMethod {
    params: $ElementType<MessageType, 'TezosSignTx'>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Tezos'), this.firmwareRange);
        this.info = 'Sign Tezos transaction';

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'branch', type: 'string', obligatory: true },
            { name: 'operation', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        this.params = helper.createTx(path, payload.branch, payload.operation);
    }

    async run() {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('TezosSignTx', 'TezosSignedTx', this.params);
        return response.message;
    }
}
