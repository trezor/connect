/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { validatePath, getSerializedPath } from '../../utils/pathUtils';
import { toChecksumAddress, getNetworkLabel } from '../../utils/ethereumUtils';
import { getEthereumNetwork } from '../../data/CoinInfo';
import { uniq } from 'lodash';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { EthereumAddress } from '../../types/trezor';
import type { EthereumAddress as EthereumAddressResponse } from '../../types/ethereum';
import type { CoreMessage } from '../../types';
import type { EthereumNetworkInfo } from 'flowtype';

type Batch = {
    path: Array<number>,
    network: ?EthereumNetworkInfo,
    showOnTrezor: boolean,
}

type Params = {
    bundle: Array<Batch>,
    bundledResponse: boolean,
}

export default class EthereumGetAddress extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.requiredFirmware = ['1.6.2', '2.0.7'];

        const payload: Object = message.payload;
        let bundledResponse: boolean = true;
        // create a bundle with only one batch
        if (!payload.hasOwnProperty('bundle')) {
            payload.bundle = [ ...payload ];
            bundledResponse = false;
        }

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
        ]);

        const bundle = [];
        let shouldUseUi: boolean = false;

        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', obligatory: true },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            const path: Array<number> = validatePath(batch.path, 3);
            const network: ?EthereumNetworkInfo = getEthereumNetwork(path);

            let showOnTrezor: boolean = true;
            if (batch.hasOwnProperty('showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }
            if (showOnTrezor) {
                shouldUseUi = true;
            }

            bundle.push({
                path,
                network,
                showOnTrezor,
            });
        });

        // set info
        if (bundle.length === 1) {
            this.info = getNetworkLabel('Export #NETWORK address', bundle[0].network);
        } else {
            const requestedNetworks: Array<?EthereumNetworkInfo> = bundle.map(b => b.network);
            const uniqNetworks = uniq(requestedNetworks);
            if (uniqNetworks.length === 1 && uniqNetworks[0]) {
                this.info = getNetworkLabel('Export multiple #NETWORK addresses', uniqNetworks[0]);
            } else {
                this.info = 'Export multiple addresses';
            }
        }

        this.useUi = shouldUseUi;

        this.params = {
            bundle,
            bundledResponse,
        };
    }

    async run(): Promise<EthereumAddressResponse | Array<EthereumAddressResponse>> {
        const responses: Array<EthereumAddressResponse> = [];
        for (let i = 0; i < this.params.bundle.length; i++) {
            const batch: Batch = this.params.bundle[i];
            const response: EthereumAddress = await this.device.getCommands().ethereumGetAddress(
                batch.path,
                batch.showOnTrezor
            );

            response.address = toChecksumAddress(response.address, batch.network);
            responses.push({
                address: response.address,
                path: batch.path,
                serializedPath: getSerializedPath(batch.path),
            });

            if (this.params.bundledResponse) {
                // send progress
                this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }
        }
        return this.params.bundledResponse ? responses : responses[0];
    }
}
