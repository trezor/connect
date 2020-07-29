/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getMiscNetwork } from '../../data/CoinInfo';
import { validatePath, fromHardened, getSerializedPath } from '../../utils/pathUtils';

import { UI, ERRORS } from '../../constants';
import { UiMessage } from '../../message/builder';

import type { CoreMessage, UiPromiseResponse } from '../../types';
import type { CardanoAddress, CardanoAddressParameters } from '../../types/networks/cardano';
import type { CardanoAddressParameters as CardanoAddressParametersProto } from '../../types/trezor/protobuf';

type Batch = {
    addressParameters: CardanoAddressParameters;
    addressParametersProto: CardanoAddressParametersProto;
    protocolMagic: number;
    networkId: number;
    address?: string;
    showOnTrezor: boolean;
}

type Params = Array<Batch>;

export default class CardanoGetAddress extends AbstractMethod {
    confirmed: boolean = false;
    params: Params;
    hasBundle: boolean;
    progress: number = 0;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Cardano'), this.firmwareRange);

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = Object.prototype.hasOwnProperty.call(message.payload, 'bundle');
        const payload: Object = !this.hasBundle ? { ...message.payload, bundle: [ message.payload ] } : message.payload;

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
            { name: 'useEventListener', type: 'boolean' },
        ]);

        const bundle = [];
        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'addressParameters', type: 'object', obligatory: true },
                { name: 'networkId', type: 'number', obligatory: true },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            validateParams(batch.addressParameters, [
                { name: 'addressType', type: 'number', obligatory: true },
                { name: 'path', type: 'string', obligatory: true },
                { name: 'stakingPath', type: 'string' },
                { name: 'stakingKeyHash', type: 'string' },
            ]);

            if (batch.addressParameters.certificatePointer) {
                validateParams(batch.addressParameters.certificatePointer, [
                    { name: 'blockIndex', type: 'number', obligatory: true },
                    { name: 'txIndex', type: 'number', obligatory: true },
                    { name: 'certificateIndex', type: 'number', obligatory: true },
                ]);
            }

            let showOnTrezor: boolean = true;
            if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }

            bundle.push({
                addressParametersProto: this.addressParametersToProto(batch.addressParameters),
                addressParameters: batch.addressParameters,
                protocolMagic: batch.protocolMagic,
                networkId: batch.networkId,
                showOnTrezor,
            });
        });

        const useEventListener = payload.useEventListener && bundle.length === 1 && typeof bundle[0].address === 'string' && bundle[0].showOnTrezor;
        this.confirmed = useEventListener;
        this.useUi = !useEventListener;
        this.params = bundle;

        // set info
        if (bundle.length === 1) {
            this.info = `Export Cardano address for account #${ (fromHardened(this.params[0].addressParametersProto.address_n[2])) }`;
        } else {
            this.info = 'Export multiple Cardano addresses';
        }
    }

    addressParametersToProto(addressParameters: CardanoAddressParameters): CardanoAddressParametersProto {
        const path = validatePath(addressParameters.path, 3);

        let stakingPath = [];
        if (addressParameters.stakingPath) {
            stakingPath = validatePath(addressParameters.stakingPath, 3);
        }

        let certificatePointer;
        if (addressParameters.certificatePointer) {
            certificatePointer = {
                block_index: addressParameters.certificatePointer.blockIndex,
                tx_index: addressParameters.certificatePointer.txIndex,
                certificate_index: addressParameters.certificatePointer.certificateIndex,
            };
        }

        return {
            address_type: addressParameters.addressType,
            address_n: path,
            address_n_staking: stakingPath,
            staking_key_hash: addressParameters.stakingKeyHash,
            certificate_pointer: certificatePointer,
        };
    }

    getButtonRequestData(code: string) {
        if (code === 'ButtonRequest_Address') {
            const data = {
                type: 'address',
                serializedPath: getSerializedPath(this.params[this.progress].addressParametersProto.address_n),
                address: this.params[this.progress].address || 'not-set',
            };
            return data;
        }
        return null;
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        const label: string = this.info;
        // request confirmation view
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-address',
            label,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async noBackupConfirmation(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'no-backup',
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        return uiResp.payload;
    }

    async run(): Promise<CardanoAddress | Array<CardanoAddress>> {
        const responses: Array<CardanoAddress> = [];

        for (let i = 0; i < this.params.length; i++) {
            const batch: Batch = this.params[i];
            // silently get address and compare with requested address
            // or display as default inside popup
            if (batch.showOnTrezor) {
                const silent = await this.device.getCommands().cardanoGetAddress(
                    batch.addressParametersProto,
                    batch.protocolMagic,
                    batch.networkId,
                    false
                );
                if (typeof batch.address === 'string') {
                    if (batch.address !== silent.address) {
                        throw ERRORS.TypedError('Method_AddressNotMatch');
                    }
                } else {
                    batch.address = silent.address;
                }
            }

            const response = await this.device.getCommands().cardanoGetAddress(
                batch.addressParametersProto,
                batch.protocolMagic,
                batch.networkId,
                batch.showOnTrezor
            );

            responses.push({
                addressParameters: batch.addressParameters,
                protocolMagic: batch.protocolMagic,
                networkId: batch.networkId,
                serializedPath: getSerializedPath(batch.addressParametersProto.address_n),
                serializedStakingPath: getSerializedPath(batch.addressParametersProto.address_n_staking),
                address: response.address,
            });

            if (this.hasBundle) {
                // send progress
                this.postMessage(UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }

            this.progress++;
        }
        return this.hasBundle ? responses : responses[0];
    }
}
