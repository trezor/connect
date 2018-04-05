/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from '../CoreMessage';
import { validatePath } from '../../utils/pathUtils';
import { getCoinInfoByCurrency } from '../../backend/CoinInfo';
import type { HDNodeResponse } from '../../device/trezorTypes';

export default class GetDeviceState extends AbstractMethod {

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = false;
    }

    async run(): Promise<Object> {

        if (this.device.state) {
            return {
                state: this.device.state
            }
        }

        const response: string = await this.device.getCommands().getDeviceState();
        const state: string = this.device.state ? this.device.state : response;

        return {
            state
        }
    }
}
