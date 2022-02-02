/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/eosSignTx';

import type { EosTxHeader, EosTxActionAck } from '../../types/trezor/protobuf';

type Params = {
    path: number[],
    chain_id: string,
    header: EosTxHeader,
    ack: $Exact<EosTxActionAck>[],
};

export default class EosSignTransaction extends AbstractMethod<'eosSignTransaction'> {
    params: Params;

    init() {
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('EOS'), this.firmwareRange);
        this.info = 'Sign EOS transaction';

        const { payload } = this;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', required: true },
            { name: 'transaction', required: true },
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

    async run() {
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
