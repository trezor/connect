/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { fromHardened, getSerializedPath } from '../../utils/pathUtils';
import {
    addressParametersFromProto,
    addressParametersToProto,
    modifyAddressParametersForBackwardsCompatibility,
    validateAddressParameters,
} from './helpers/cardanoAddressParameters';

import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';

import type { CardanoAddress } from '../../types/networks/cardano';
import { CardanoAddressType } from '../../types/networks/cardano';
import type { MessageType } from '../../types/trezor/protobuf';
import { Enum_CardanoDerivationType as CardanoDerivationType } from '../../types/trezor/protobuf';

type Params = {
    ...$ElementType<MessageType, 'CardanoGetAddress'>,
    address?: string,
};

export default class CardanoGetAddress extends AbstractMethod<'cardanoGetAddress'> {
    params: Params[] = [];

    hasBundle: boolean;

    progress: number = 0;

    confirmed: ?boolean;

    init() {
        this.requiredPermissions = ['read'];
        this.firmwareRange = getFirmwareRange(
            this.name,
            getMiscNetwork('Cardano'),
            this.firmwareRange,
        );

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = !!this.payload.bundle;
        const payload = !this.payload.bundle
            ? { ...this.payload, bundle: [this.payload] }
            : this.payload;

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
            { name: 'useEventListener', type: 'boolean' },
        ]);

        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'addressParameters', type: 'object', required: true },
                { name: 'networkId', type: 'number', required: true },
                { name: 'protocolMagic', type: 'number', required: true },
                { name: 'derivationType', type: 'number' },
                { name: 'address', type: 'string' },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            validateAddressParameters(batch.addressParameters);

            let showOnTrezor = true;
            if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }

            this.params.push({
                address_parameters: addressParametersToProto(batch.addressParameters),
                address: batch.address,
                protocol_magic: batch.protocolMagic,
                network_id: batch.networkId,
                derivation_type:
                    typeof batch.derivationType !== 'undefined'
                        ? batch.derivationType
                        : CardanoDerivationType.ICARUS_TREZOR,
                show_display: showOnTrezor,
            });
        });

        const useEventListener =
            payload.useEventListener &&
            this.params.length === 1 &&
            typeof this.params[0].address === 'string' &&
            this.params[0].show_display;
        this.confirmed = useEventListener;
        this.useUi = !useEventListener;

        // set info
        if (this.params.length === 1) {
            this.info = `Export Cardano address for account #${
                fromHardened(this.params[0].address_parameters.address_n[2]) + 1
            }`;
        } else {
            this.info = 'Export multiple Cardano addresses';
        }
    }

    getButtonRequestData(code: string) {
        if (code === 'ButtonRequest_Address') {
            const data = {
                type: 'address',
                serializedPath: getSerializedPath(
                    this.params[this.progress].address_parameters.address_n,
                ),
                address: this.params[this.progress].address || 'not-set',
            };
            return data;
        }
        return null;
    }

    async confirmation() {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(
            UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'export-address',
                label: this.info,
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async noBackupConfirmation() {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(
            UiMessage(UI.REQUEST_CONFIRMATION, {
                view: 'no-backup',
            }),
        );

        // wait for user action
        const uiResp = await uiPromise.promise;
        return uiResp.payload;
    }

    async _call({
        address_parameters,
        protocol_magic,
        network_id,
        derivation_type,
        show_display,
    }: Params) {
        const cmd = this.device.getCommands();
        const response = await cmd.typedCall('CardanoGetAddress', 'CardanoAddress', {
            address_parameters,
            protocol_magic,
            network_id,
            derivation_type,
            show_display,
        });
        return response.message;
    }

    _ensureFirmwareSupportsBatch(batch: Params) {
        const SCRIPT_ADDRESSES_TYPES = [
            CardanoAddressType.BASE_SCRIPT_KEY,
            CardanoAddressType.BASE_KEY_SCRIPT,
            CardanoAddressType.BASE_SCRIPT_SCRIPT,
            CardanoAddressType.POINTER_SCRIPT,
            CardanoAddressType.ENTERPRISE_SCRIPT,
            CardanoAddressType.REWARD_SCRIPT,
        ];

        if (SCRIPT_ADDRESSES_TYPES.includes(batch.address_parameters.address_type)) {
            if (!this.device.atLeast(['0', '2.4.3'])) {
                throw ERRORS.TypedError(
                    'Method_InvalidParameter',
                    `Address type not supported by device firmware`,
                );
            }
        }
    }

    async run() {
        const responses: CardanoAddress[] = [];

        for (let i = 0; i < this.params.length; i++) {
            const batch = this.params[i];

            this._ensureFirmwareSupportsBatch(batch);
            batch.address_parameters = modifyAddressParametersForBackwardsCompatibility(
                this.device,
                batch.address_parameters,
            );

            // silently get address and compare with requested address
            // or display as default inside popup
            if (batch.show_display) {
                const silent = await this._call({
                    ...batch,
                    show_display: false,
                });
                if (typeof batch.address === 'string') {
                    if (batch.address !== silent.address) {
                        throw ERRORS.TypedError('Method_AddressNotMatch');
                    }
                } else {
                    batch.address = silent.address;
                }
            }

            const response = await this._call(batch);

            responses.push({
                addressParameters: addressParametersFromProto(batch.address_parameters),
                protocolMagic: batch.protocol_magic,
                networkId: batch.network_id,
                serializedPath: getSerializedPath(batch.address_parameters.address_n),
                serializedStakingPath: getSerializedPath(
                    batch.address_parameters.address_n_staking,
                ),
                address: response.address,
            });

            if (this.hasBundle) {
                // send progress
                this.postMessage(
                    UiMessage(UI.BUNDLE_PROGRESS, {
                        progress: i,
                        response,
                    }),
                );
            }

            this.progress++;
        }
        return this.hasBundle ? responses : responses[0];
    }
}
