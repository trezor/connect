/* @flow */

import AbstractMethod from './AbstractMethod';
import * as UI from '../../constants/ui';
import { validateParams } from './helpers/paramsValidator';

import type { CoreMessage } from '../../types';

type Params = {
    length?: number,
}

export default class FirmwareErase extends AbstractMethod {
    params: Params;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.useUi = false;
        const payload: Object = message.payload;

        validateParams(payload, [
            { name: 'length', type: 'number' },
        ]);

        this.params = {
            length: payload.length,
        };

        // todo: maybe only bootloader and not 'normal' mode?
        this.allowDeviceMode = [...this.allowDeviceMode, UI.BOOTLOADER, UI.INITIALIZE];
        this.useUi = false;
        this.useDeviceState = false;
    }

    async run(): Promise<Object> {
        return await this.device.getCommands().firmwareErase(this.params);
    }
}
