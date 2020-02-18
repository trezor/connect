/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getEthereumNetwork } from '../../data/CoinInfo';
import { getNetworkLabel } from '../../utils/ethereumUtils';
import { stripHexPrefix } from '../../utils/formatUtils';
import * as helper from './helpers/ethereumSignTx';

import type { CoreMessage } from '../../types';
import type { EthereumSignedTx } from '../../types/trezor/protobuf';
import type { EthereumTransaction } from '../../types/networks/ethereum';

type Params = {
    path: Array<number>;
    transaction: EthereumTransaction;
}

export default class EthereumSignTx extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read', 'write'];

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path: Array<number> = validatePath(payload.path, 3);
        const network = getEthereumNetwork(path);
        this.firmwareRange = getFirmwareRange(this.name, network, this.firmwareRange);

        this.info = getNetworkLabel('Sign #NETWORK transaction', network);

        // incoming transaction should be in EthereumTx format
        // https://github.com/ethereumjs/ethereumjs-tx
        const tx: EthereumTransaction = payload.transaction;
        validateParams(tx, [
            { name: 'to', type: 'string', obligatory: true },
            { name: 'value', type: 'string', obligatory: true },
            { name: 'gasLimit', type: 'string', obligatory: true },
            { name: 'gasPrice', type: 'string', obligatory: true },
            { name: 'nonce', type: 'string', obligatory: true },
            { name: 'data', type: 'string' },
            { name: 'chainId', type: 'number' },
            { name: 'txType', type: 'number' },
        ]);

        // TODO: check if tx data is a valid hex

        // strip '0x' from values
        Object.keys(tx).map(key => {
            if (typeof tx[key] === 'string') {
                let value: string = stripHexPrefix(tx[key]);
                // pad left even
                if (value.length % 2 !== 0) { value = '0' + value; }
                // $FlowIssue
                tx[key] = value;
            }
        });

        this.params = {
            path,
            transaction: tx,
        };
    }

    async run(): Promise<EthereumSignedTx> {
        const tx = this.params.transaction;
        return await helper.ethereumSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            tx.to,
            tx.value,
            tx.gasLimit,
            tx.gasPrice,
            tx.nonce,
            tx.data,
            tx.chainId,
            tx.txType
        );
    }
}
