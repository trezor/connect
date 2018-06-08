/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import type { CoreMessage } from 'flowtype';

type Params = {
    cycle: (message: (type: string, msg: Object) => Promise<any>) => Promise<any>;
}

export default class CustomMessage extends AbstractMethod {

    params: Params;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.requiredFirmware = '1.0.0';
        this.useDevice = true;
        this.useUi = true;


        const payload: any = message.payload;

        // this.params = {
        //     name: 'NEMGetAddress',
        //     fields: {
        //         address_n: [44, 1, 1]
        //     }
        // }
        this.params = {
            cycle: async (message) => {
                const response = await message('StellarGetPublicKey', { address_n: 1 });

                console.log("RESPOOO", response);
                if (response && response.type === 'ButtonRequest') {
                    await message('ButtonAck', {});
                }
                // return 1;
            }
        }
    }

    async run(): Promise<Object> {

        await this.params.cycle( this.device.getCommands().call.bind( this.device.getCommands() ) );
        return { foo: 1 };
        // console.warn("RUNNNNN", this.params);
        // const response = await this.device.getCommands().call(this.params.name, this.params.fields);
        // console.warn("RUNNNNN result", response);
        // const response2 = await this.device.getCommands().call(this.params.name, this.params.fields);
        // console.warn("RUNNNNN2 result", response);
        // return response;
    }
}
