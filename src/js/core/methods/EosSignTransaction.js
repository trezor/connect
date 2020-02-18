/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/eosSignTx';

import type { EosTxHeader, EosTxActionAck, EosSignedTx } from '../../types/trezor/protobuf';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>;
    chain_id: string;
    header: ?EosTxHeader;
    ack: Array<EosTxActionAck>;
}

export default class EosSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('EOS'), this.firmwareRange);
        this.info = 'Sign EOS transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        const { chain_id, header, ack } = helper.validate(path, payload.transaction);

        this.params = {
            path,
            chain_id,
            header,
            ack,
        };
    }

    async run(): Promise<EosSignedTx> {
        const response = await helper.signTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.chain_id,
            this.params.header,
            this.params.ack,
        );

        return {
            signature: response.signature,
        };
    }
}
