/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from 'flowtype';

type Params = {
    //fn: (message: (type: string, msg: Object) => Promise<any>) => Promise<any>;
    fn: string;
}

export default class CustomMessage extends AbstractMethod {

    params: Params;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['custom-message'];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = true;
        this.info = 'Custom message';

        const payload: any = message.payload;
        if (typeof payload.customFunction !== 'string') {
            // throw new Error('Parameter "customFunction" has invalid type. Function expected.');
        }

        this.params = {
            fn: payload.customFunction,
        }
    }

    async run(): Promise<Object> {
        let fn = eval('(' + decodeURI(this.params.fn) + ');');
        // return await fn( this.device.getCommands().call.bind( this.device.getCommands() ) );
        return await fn( this.device.getCommands()._commonCall.bind( this.device.getCommands() ) );
    }
}
