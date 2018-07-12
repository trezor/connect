/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import type { MessageResponse } from '../../device/DeviceCommands';
import type { EthereumAddress } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>;
    showOnTrezor: boolean;
}

export default class EthereumGetAddress extends AbstractMethod {

    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = ['1.6.2', '2.0.7'];
        this.info = 'Export Ethereum address';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'showOnTrezor', type: 'boolean' },
        ]);

        const path: Array<number> = validatePath(payload.path);
        let showOnTrezor: boolean = true;
        if (payload.hasOwnProperty('showOnTrezor')){
            showOnTrezor = payload.showOnTrezor;
        }

        this.useUi = showOnTrezor;

        this.params = {
            path,
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
