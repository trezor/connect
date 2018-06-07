/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';
import type { EthereumSignature } from '../../device/helpers/ethereumSigntx';
import type { CoreMessage } from 'flowtype';

type Params = {
    path: Array<number>;
    nonce: string;
    gasPrice: string;
    gasLimit: string;
    to: string;
    value: string;
    data: string;
    chainId: number;
}

export default class EthereumSignTx extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['write'];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = true;

        const payload: any = message.payload;

        if (!payload.hasOwnProperty('path')) {
            throw new Error('Parameter "path" is missing');
        } else {
            payload.path = validatePath(payload.path);
        }

        if (!payload.hasOwnProperty('nonce')) {
            throw new Error('Parameter "nonce" is missing');
        } else {
            if (typeof payload.nonce !== 'string') {
                throw new Error('Parameter "nonce" has invalid type. String expected.');
            }
        }

        if (!payload.hasOwnProperty('gasPrice')) {
            throw new Error('Parameter "gasPrice" is missing');
        } else {
            if (typeof payload.gasPrice !== 'string') {
                throw new Error('Parameter "gasPrice" has invalid type. String expected.');
            }
        }

        if (!payload.hasOwnProperty('gasLimit')) {
            throw new Error('Parameter "gasLimit" is missing');
        } else {
            if (typeof payload.gasLimit !== 'string') {
                throw new Error('Parameter "gasLimit" has invalid type. String expected.');
            }
        }

        if (!payload.hasOwnProperty('to')) {
            throw new Error('Parameter "to" is missing');
        } else {
            if (typeof payload.to !== 'string') {
                throw new Error('Parameter "to" has invalid type. String expected.');
            }
        }

        if (!payload.hasOwnProperty('value')) {
            throw new Error('Parameter "value" is missing');
        } else {
            if (typeof payload.value !== 'string') {
                throw new Error('Parameter "value" has invalid type. String expected.');
            }
        }

        if (payload.hasOwnProperty('data') && typeof payload.data !== 'string') {
            throw new Error('Parameter "data" has invalid type. String expected.');
        }

        if (payload.hasOwnProperty('chainId') && typeof payload.chainId !== 'number') {
            throw new Error('Parameter "chainId" has invalid type. Number expected.');
        }

        this.params = {
            path: payload.path,
            nonce: payload.nonce,
            gasPrice: payload.gasPrice,
            gasLimit: payload.gasLimit,
            to: payload.to,
            value: payload.value,
            data: payload.data,
            chainId: payload.chainId
        }
    }

    async run(): Promise<Object> {
        const response: EthereumSignature = await this.device.getCommands().ethereumSignTx(
            this.params.path,
            this.params.nonce,
            this.params.gasPrice,
            this.params.gasLimit,
            this.params.to,
            this.params.value,
            this.params.data,
            this.params.chainId
        );
        return response;
    }
}
