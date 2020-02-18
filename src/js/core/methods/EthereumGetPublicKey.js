/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';
import { getNetworkLabel } from '../../utils/ethereumUtils';
import { getEthereumNetwork, getUniqueNetworks } from '../../data/CoinInfo';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { CoreMessage, UiPromiseResponse, EthereumNetworkInfo } from '../../types';
import type { HDNodeResponse } from '../../types/trezor/protobuf';

type Batch = {
    path: Array<number>;
    network: ?EthereumNetworkInfo;
    showOnTrezor: boolean;
}

type Params = Array<Batch>;

export default class EthereumGetPublicKey extends AbstractMethod {
    confirmed: boolean = false;
    params: Params;
    hasBundle: boolean;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];

        // create a bundle with only one batch if bundle doesn't exists
        this.hasBundle = Object.prototype.hasOwnProperty.call(message.payload, 'bundle');
        const payload: Object = !this.hasBundle ? { ...message.payload, bundle: [ message.payload ] } : message.payload;

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
        ]);

        const bundle = [];
        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', obligatory: true },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            const path = validatePath(batch.path, 3);
            const network = getEthereumNetwork(path);
            this.firmwareRange = getFirmwareRange(this.name, network, this.firmwareRange);

            let showOnTrezor = false;
            if (Object.prototype.hasOwnProperty.call(batch, 'showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }

            bundle.push({
                path,
                network,
                showOnTrezor,
            });
        });

        this.params = bundle;

        // set info
        if (bundle.length === 1) {
            this.info = getNetworkLabel('Export #NETWORK public key', bundle[0].network);
        } else {
            const requestedNetworks = bundle.map(b => b.network);
            const uniqNetworks = getUniqueNetworks(requestedNetworks);
            if (uniqNetworks.length === 1 && uniqNetworks[0]) {
                this.info = getNetworkLabel('Export multiple #NETWORK public keys', uniqNetworks[0]);
            } else {
                this.info = 'Export multiple public keys';
            }
        }
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-xpub',
            label: this.info,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async run(): Promise<HDNodeResponse | Array<HDNodeResponse>> {
        const responses: Array<HDNodeResponse> = [];

        for (let i = 0; i < this.params.length; i++) {
            const batch: Batch = this.params[i];
            const response = await this.device.getCommands().ethereumGetPublicKey(
                batch.path,
                batch.showOnTrezor
            );
            responses.push(response);

            if (this.hasBundle) {
                // send progress
                this.postMessage(UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }
        }
        return this.hasBundle ? responses : responses[0];
    }
}
