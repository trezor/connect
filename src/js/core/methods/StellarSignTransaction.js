/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import * as helper from './helpers/stellarSignTx';

import type { CoreMessage, StellarTransaction } from '../../types';
import { ERRORS } from '../../constants';

const StellarSignTransactionFeatures = Object.freeze({
    StellarCreateAccountOp: ['1.10.3', '2.4.2'],
    StellarPaymentOp: ['1.10.3', '2.4.2'],
    StellarPathPaymentStrictReceiveOp: ['1.10.4', '2.4.3'],
    StellarPathPaymentStrictSendOp: ['1.10.4', '2.4.3'],
    StellarCreatePassiveSellOfferOp: ['1.10.4', '2.4.3'],
    StellarManageSellOfferOp: ['1.10.4', '2.4.3'],
    StellarManageBuyOfferOp: ['1.10.4', '2.4.3'],
    StellarSetOptionsOp: ['1.10.3', '2.4.2'],
    StellarChangeTrustOp: ['1.10.3', '2.4.2'],
    StellarAllowTrustOp: ['1.10.3', '2.4.2'],
    StellarAccountMergeOp: ['1.10.3', '2.4.2'],
    StellarManageDataOp: ['1.10.3', '2.4.2'],
    StellarBumpSequenceOp: ['1.10.3', '2.4.2'],
});

type Params = {
    path: number[],
    networkPassphrase: string,
    transaction: StellarTransaction,
};

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
        params.transaction.operations.forEach(operation => {
            switch (operation.type) {
                case 'createAccount':
                    this._ensureFeatureIsSupported('StellarCreateAccountOp');
                    break;
                case 'payment':
                    this._ensureFeatureIsSupported('StellarPaymentOp');
                    break;
                case 'pathPaymentStrictReceive':
                    this._ensureFeatureIsSupported('StellarPathPaymentStrictReceiveOp');
                    break;
                case 'pathPaymentStrictSend':
                    this._ensureFeatureIsSupported('StellarPathPaymentStrictSendOp');
                    break;
                case 'createPassiveSellOffer':
                    this._ensureFeatureIsSupported('StellarCreatePassiveSellOfferOp');
                    break;
                case 'manageSellOffer':
                    this._ensureFeatureIsSupported('StellarManageSellOfferOp');
                    break;
                case 'manageBuyOffer':
                    this._ensureFeatureIsSupported('StellarManageBuyOfferOp');
                    break;
                case 'setOptions':
                    this._ensureFeatureIsSupported('StellarSetOptionsOp');
                    break;
                case 'changeTrust':
                    this._ensureFeatureIsSupported('StellarChangeTrustOp');
                    break;
                case 'accountMerge':
                    this._ensureFeatureIsSupported('StellarAccountMergeOp');
                    break;
                case 'manageData':
                    this._ensureFeatureIsSupported('StellarManageDataOp');
                    break;
                case 'bumpSequence':
                    this._ensureFeatureIsSupported('StellarBumpSequenceOp');
                    break;
                case 'inflation':
                    // InflationOp has been deprecated and is not supported by Trezor
                    break;
                default:
                    break;
            }
        });
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
