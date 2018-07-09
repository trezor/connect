/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/ethereumSignTx';
import type { MessageResponse } from '../../device/DeviceCommands';
import type { CoreMessage } from '../../types';
import type { EthereumSignedTx } from '../../types/trezor';
import type { Transaction as EthereumTransaction } from '../../types/ethereum';

type Params = {
    path: Array<number>;
    transaction: EthereumTransaction;
}

export default class EthereumSignTx extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['write'];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = true;
        this.info = 'Sign Ethereum transaction';

        const payload: any = message.payload;

        if (!payload.hasOwnProperty('path')) {
            throw new Error('Parameter "path" is missing');
        } else {
            payload.path = validatePath(payload.path);
        }

        // incoming transaction should be in EthereumTx format
        // https://github.com/ethereumjs/ethereumjs-tx

        const tx: ?EthereumTransaction = payload.transaction;
        if (!tx) {
            throw new Error('Parameter "transaction" is missing');
        } else {

            if (!tx.hasOwnProperty('to')) {
                throw new Error('Parameter "transaction.to" is missing');
            } else if (typeof tx.to !== 'string') {
                throw new Error('Parameter "transaction.to" has invalid type. String expected.');
            }

            if (!tx.hasOwnProperty('value')) {
                throw new Error('Parameter "transaction.value" is missing');
            } else if (typeof tx.value !== 'string') {
                throw new Error('Parameter "transaction.value" has invalid type. Hexadecimal string expected.');
            }

            if (!tx.hasOwnProperty('gasLimit')) {
                throw new Error('Parameter "transaction.gasLimit" is missing');
            } else if (typeof tx.gasLimit !== 'string') {
                throw new Error('Parameter "transaction.gasLimit" has invalid type. String expected.');
            }

            if (!tx.hasOwnProperty('gasPrice')) {
                throw new Error('Parameter "transaction.gasPrice" is missing');
            } else if (typeof tx.gasPrice !== 'string') {
                throw new Error('Parameter "transaction.gasPrice" has invalid type. String expected.');
            }

            if (!tx.hasOwnProperty('nonce')) {
                throw new Error('Parameter "transaction.nonce" is missing');
            } else if (typeof tx.nonce !== 'string') {
                throw new Error('Parameter "transaction.nonce" has invalid type. String expected.');
            }

            if (tx.hasOwnProperty('data') && typeof tx.data !== 'string') {
                throw new Error('Parameter "transaction.data" has invalid type. String expected.');
            }

            if (tx.hasOwnProperty('chainId') && typeof tx.chainId !== 'number') {
                throw new Error('Parameter "transaction.chainId" has invalid type. Number expected.');
            }
        }

        // strip '0x' from values
        Object.keys(tx).map(key => {
            if (typeof tx[key] === 'string') {
                let value: string = tx[key];
                if (value.indexOf('0x') === 0) {
                    value = value.substring(2, value.length);
                    // pad left even
                    if (value.length % 2 !== 0)
                        value = '0' + value;
                    // $FlowIssue
                    tx[key] = value;
                }
            }
        });

        this.params = {
            path: payload.path,
            transaction: tx,
        }
    }

    async run(): Promise<EthereumSignedTx> {

        const tx = this.params.transaction;
        return await helper.ethereumSignTx(
            this.device.getCommands().typedCall.bind( this.device.getCommands() ),
            this.params.path,
            tx.to,
            tx.value,
            tx.gasLimit,
            tx.gasPrice,
            tx.nonce,
            tx.data,
            tx.chainId
        );

        // const signedTx: EthereumTransaction = {
        //     to: '0x' + tx.to,
        //     value: '0x' + tx.value,
        //     gasLimit: '0x' + tx.gasLimit,
        //     gasPrice: '0x' + tx.gasPrice,
        //     nonce: '0x' + tx.nonce,
        //     r: '0x' + response.r,
        //     s: '0x' + response.s,
        //     v: '0x' + response.v.toString(16)
        // }

        // if (tx.data) {
        //     signedTx.data = '0x' + tx.data;
        // }

        // if (tx.chainId) {
        //     signedTx.chainId = tx.chainId;
        // }

        // return signedTx;
    }
}
