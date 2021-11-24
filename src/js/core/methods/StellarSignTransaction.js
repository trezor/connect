/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/stellarSignTx';
import { ERRORS } from '../../constants';

import type { CoreMessage } from '../../types';

type Params = {
    path: number[],
    networkPassphrase: string,
    transaction: any,
};

const StellarSignTransactionFeatures = Object.freeze({
    manageBuyOffer: ['1.10.4', '2.4.3'],
    pathPaymentStrictSend: ['1.10.4', '2.4.3'],
});

export default class StellarSignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.firmwareRange = getFirmwareRange(
            this.name,
            getMiscNetwork('Stellar'),
            this.firmwareRange,
        );
        this.info = 'Sign Stellar transaction';

        const { payload } = message;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'path', obligatory: true },
            { name: 'networkPassphrase', type: 'string', obligatory: true },
            { name: 'transaction', obligatory: true },
        ]);

        const path = validatePath(payload.path, 3);
        // incoming data should be in stellar-sdk format
        const { transaction } = payload;
        this.params = {
            path,
            networkPassphrase: payload.networkPassphrase,
            transaction,
        };
    }

    _isFeatureSupported(feature: $Keys<typeof StellarSignTransactionFeatures>) {
        return this.device.atLeast(StellarSignTransactionFeatures[feature]);
    }

    _ensureFeatureIsSupported(feature: $Keys<typeof StellarSignTransactionFeatures>) {
        if (!this._isFeatureSupported(feature)) {
            throw ERRORS.TypedError(
                'Method_InvalidParameter',
                `Feature ${feature} not supported by device firmware`,
            );
        }
    }

    _ensureFirmwareSupportsParams() {
        const { params } = this;
        if (
            params.transaction.operations &&
            params.transaction.operations.find(o => o.type === 'manageBuyOffer')
        ) {
            this._ensureFeatureIsSupported('manageBuyOffer');
        }

        if (
            params.transaction.operations &&
            params.transaction.operations.find(o => o.type === 'pathPaymentStrictSend')
        ) {
            this._ensureFeatureIsSupported('pathPaymentStrictSend');
        }
    }

    async run() {
        this._ensureFirmwareSupportsParams();

        const response = await helper.stellarSignTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            this.params.path,
            this.params.networkPassphrase,
            this.params.transaction,
        );

        return {
            publicKey: response.public_key,
            signature: response.signature,
        };
    }
}
