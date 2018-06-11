/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';
import type { EthereumAddress } from 'flowtype/trezor';
import type { CoreMessage } from 'flowtype';

type Params = {
    path: Array<number>;
    showOnTrezor: boolean;
}

export default class EthereumGetAddress extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.info = 'Export Ethereum address';

        const payload: any = message.payload;

        if (!payload.hasOwnProperty('path')) {
            throw new Error('Parameter "path" is missing');
        } else {
            payload.path = validatePath(payload.path);
        }

        let showOnTrezor: boolean = true;
        if (payload.hasOwnProperty('showOnTrezor')){
            if (typeof payload.showOnTrezor !== 'boolean') {
                throw new Error('Parameter "showOnTrezor" has invalid type. Boolean expected.');
            } else {
                showOnTrezor = payload.showOnTrezor;
            }
        }

        this.useUi = showOnTrezor;

        this.params = {
            path: payload.path,
            showOnTrezor
        }
    }

    async run(): Promise<Object> {
        const response: MessageResponse<EthereumAddress> = await this.device.getCommands().ethereumGetAddress(
            this.params.path,
            this.params.showOnTrezor
        );
        return {
            ...response.message
        };
    }
}
