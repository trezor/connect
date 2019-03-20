/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/kinSignTx';

import type { KinSignedTx } from '../../types/trezor';
import type { Transaction as $KinTransaction, KinSignedTx as KinSignedTxResponse } from '../../types/kin';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>,
    networkPassphrase: string,
    transaction: any,
}

export default class KinSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Kin'), this.firmwareRange);
        this.info = 'Sign Kin transaction';

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'networkPassphrase', type: 'string', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in kin-sdk format
        const transaction: $KinTransaction = payload.transaction;
        this.params = {
            path,
            networkPassphrase: payload.networkPassphrase,
            transaction,
        };
    }

    async run(): Promise<KinSignedTxResponse> {
        const response: KinSignedTx = await helper.kinSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.networkPassphrase,
            this.params.transaction
        );

        return {
            publicKey: response.public_key,
            signature: response.signature,
        };
    }
}
