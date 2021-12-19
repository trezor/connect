/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/tezosSignTx';
import type { MessageType } from '../../types/trezor/protobuf';

export default class TezosSignTransaction extends AbstractMethod<'tezosSignTransaction'> {
    params: $ElementType<MessageType, 'TezosSignTx'>;

    init() {
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(
            this.name,
            getMiscNetwork('Tezos'),
            this.firmwareRange,
        );
        this.info = 'Sign Tezos transaction';

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', required: true },
            { name: 'branch', type: 'string', required: true },
            { name: 'operation', required: true },
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
