/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';

import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';
import DataManager from '../../data/DataManager';

import type { ConnectSettings, CoreMessage } from '../../types';
import type { MessageType, IdentityType } from '../../types/trezor/protobuf';

export default class RequestLogin extends AbstractMethod {
    params: $ElementType<MessageType, 'SignIdentity'>;
    asyncChallenge: boolean;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Login';
        this.useEmptyPassphrase = true;

        const { payload } = message;

        const identity: IdentityType = {};
        const settings: ConnectSettings = DataManager.getSettings();
        if (settings.origin) {
            const uri = settings.origin.split(':');
            identity.proto = uri[0];
            identity.host = uri[1].substring(2);
            if (uri[2]) {
                identity.port = uri[2];
            }
            identity.index = 0;
        }

        // validate incoming parameters
        validateParams(payload, [
            { name: 'challengeHidden', type: 'string' },
            { name: 'challengeVisual', type: 'string' },
            { name: 'asyncChallenge', type: 'boolean' },
        ]);

        this.params = {
            identity,
            challenge_hidden: payload.challengeHidden || '',
            challenge_visual: payload.challengeVisual || '',
        };
        this.asyncChallenge = payload.asyncChallenge;
    }

    async run() {
        if (this.asyncChallenge) {
            // create ui promise
            const uiPromise = this.createUiPromise(UI.LOGIN_CHALLENGE_RESPONSE, this.device);
            // send request to developer
            this.postMessage(UiMessage(UI.LOGIN_CHALLENGE_REQUEST));
            // wait for response from developer
            const uiResp = await uiPromise.promise;
            const { payload } = uiResp.payload;

            // error handler
            if (typeof payload === 'string') {
                throw ERRORS.TypedError('Runtime', `TrezorConnect.requestLogin callback error: ${payload}`);
            }

            // validate incoming parameters
            validateParams(payload, [
                { name: 'challengeHidden', type: 'string', obligatory: true },
                { name: 'challengeVisual', type: 'string', obligatory: true },
            ]);

            this.params.challenge_hidden = payload.challengeHidden;
            this.params.challenge_visual = payload.challengeVisual;
        }
        const cmd = this.device.getCommands();
        const { message } = await cmd.typedCall('SignIdentity', 'SignedIdentity', this.params);
        return {
            address: message.address,
            publicKey: message.public_key,
            signature: message.signature,
        };
    }
}
