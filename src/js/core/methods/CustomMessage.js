/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { UI, ERRORS } from '../../constants';

import { UiMessage } from '../../message/builder';
import type { CoreMessage, UiPromiseResponse } from '../../types';

type Params = {
    customMessages: JSON;
    message: string;
    params: any;
}

export default class CustomMessage extends AbstractMethod {
    params: Params;
    run: () => Promise<any>;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['custom-message', 'read', 'write'];
        this.info = 'Custom message';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(message.payload, [
            { name: 'message', type: 'string', obligatory: true },
            { name: 'params', type: 'object', obligatory: true },
        ]);

        if (Object.prototype.hasOwnProperty.call(payload, 'messages')) {
            try {
                JSON.parse(JSON.stringify(payload.messages));
            } catch (error) {
                throw ERRORS.TypedError('Method_InvalidParameter', 'Parameter "messages" has invalid type. JSON expected.');
            }
        }

        this.params = {
            customMessages: payload.messages,
            message: payload.message,
            params: payload.params,
        };
    }

    getCustomMessages(): ?JSON {
        return this.params.customMessages;
    }

    async run(): Promise<Object> {
        if (this.device.features.vendor === 'trezor.io' || this.device.features.vendor === 'bitcointrezor.com') {
            throw ERRORS.TypedError('Runtime', 'Cannot use custom message on device with official firmware. Change device "vendor" field.');
        }
        // call message
        const response = await this.device.getCommands()._commonCall(this.params.message, this.params.params);

        // send result to developer
        this.postMessage(UiMessage(UI.CUSTOM_MESSAGE_REQUEST, response));

        // wait for response from developer
        const uiResp: UiPromiseResponse = await this.createUiPromise(UI.CUSTOM_MESSAGE_RESPONSE, this.device).promise;
        const payload = uiResp.payload;

        // validate incoming response
        validateParams(payload, [
            { name: 'message', type: 'string', obligatory: true },
        ]);

        if (payload.message.toLowerCase() === 'release') {
            // release device
            return response;
        } else {
            // validate incoming parameters
            validateParams(payload, [
                { name: 'params', type: 'object', obligatory: true },
            ]);

            // change local params and make another call to device
            this.params.message = payload.message;
            this.params.params = payload.params;
            return await this.run();
        }
    }
}
