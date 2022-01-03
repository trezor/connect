/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { UI, ERRORS } from '../../constants';

import { UiMessage } from '../../message/builder';

type Params = {
    customMessages?: JSON,
    message: string,
    params: any,
};

export default class CustomMessage extends AbstractMethod<'customMessage'> {
    params: Params;

    init() {
        this.requiredPermissions = ['custom-message', 'read', 'write'];
        this.info = 'Custom message';

        const { payload } = this;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'message', type: 'string', required: true },
            { name: 'params', type: 'object', required: true },
        ]);

        if (payload.messages) {
            try {
                JSON.parse(JSON.stringify(payload.messages));
            } catch (error) {
                throw ERRORS.TypedError(
                    'Method_InvalidParameter',
                    'Parameter "messages" has invalid type. JSON expected.',
                );
            }
        }

        this.params = {
            customMessages: payload.messages,
            message: payload.message,
            params: payload.params,
        };
    }

    getCustomMessages() {
        return this.params.customMessages;
    }

    async run() {
        if (
            this.device.features.vendor === 'trezor.io' ||
            this.device.features.vendor === 'bitcointrezor.com'
        ) {
            throw ERRORS.TypedError(
                'Runtime',
                'Cannot use custom message on device with official firmware. Change device "vendor" field.',
            );
        }
        // call message
        const response = await this.device
            .getCommands()
            // $FlowIssue message could be anything, unknown type
            ._commonCall(this.params.message, this.params.params);
        // create ui promise
        const uiPromise = this.createUiPromise(UI.CUSTOM_MESSAGE_RESPONSE, this.device);
        // send result to developer
        this.postMessage(UiMessage(UI.CUSTOM_MESSAGE_REQUEST, response));

        // wait for response from developer
        const uiResp = await uiPromise.promise;
        const { payload } = uiResp;

        // validate incoming response
        validateParams(payload, [{ name: 'message', type: 'string', required: true }]);

        if (payload.message.toLowerCase() === 'release') {
            // release device
            return response;
        }
        // validate incoming parameters
        validateParams(payload, [{ name: 'params', type: 'object', required: true }]);

        // change local params and make another call to device
        this.params.message = payload.message;
        this.params.params = payload.params;
        return this.run();
    }
}
