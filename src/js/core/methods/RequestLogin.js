/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';

import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';
import DataManager from '../../data/DataManager';

import type { ConnectSettings, CoreMessage, UiPromiseResponse } from '../../types';
import type { Identity, SignedIdentity } from '../../types/trezor/protobuf';
import type { Login } from '../../types/misc';

type Params = {
    asyncChallenge: boolean;
    identity: Identity;
    challengeHidden: string;
    challengeVisual: string;
}

export default class RequestLogin extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(this.name, null, this.firmwareRange);
        this.info = 'Login';
        this.useEmptyPassphrase = true;

        const payload: Object = message.payload;

        const identity: Identity = { };
        const settings: ConnectSettings = DataManager.getSettings();
        if (settings.origin) {
            const uri: Array<string> = settings.origin.split(':');
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
            asyncChallenge: payload.asyncChallenge,
            identity,
            challengeHidden: payload.challengeHidden || '',
            challengeVisual: payload.challengeVisual || '',
        };
    }

    async run(): Promise<Login> {
        if (this.params.asyncChallenge) {
            // send request to developer
            this.postMessage(UiMessage(UI.LOGIN_CHALLENGE_REQUEST));

            // wait for response from developer
            const uiResp: UiPromiseResponse = await this.createUiPromise(UI.LOGIN_CHALLENGE_RESPONSE, this.device).promise;
            const payload: Object = uiResp.payload;

            // error handler
            if (typeof payload === 'string') {
                throw ERRORS.TypedError('Runtime', `TrezorConnect.requestLogin callback error: ${payload}`);
            }

            // validate incoming parameters
            validateParams(payload, [
                { name: 'challengeHidden', type: 'string', obligatory: true },
                { name: 'challengeVisual', type: 'string', obligatory: true },
            ]);

            this.params.challengeHidden = payload.challengeHidden;
            this.params.challengeVisual = payload.challengeVisual;
        }

        const response: SignedIdentity = await this.device.getCommands().signIdentity(
            this.params.identity,
            this.params.challengeHidden,
            this.params.challengeVisual
        );

        return {
            address: response.address,
            publicKey: response.public_key,
            signature: response.signature,
        };
    }
}
