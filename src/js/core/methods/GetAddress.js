/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath, getRequiredFirmware } from './helpers/paramsValidator';
import { validatePath, getLabel } from '../../utils/pathUtils';
import { getCoinInfoByCurrency, getCoinInfoFromPath, fixCoinInfoNetwork } from '../../data/CoinInfo';
import { NO_COIN_INFO } from '../../constants/errors';
import { uniqBy } from 'lodash';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { Address } from '../../types/trezor';
import type { CoinInfo } from 'flowtype';
import type { CoreMessage } from '../../types';

type Batch = {
    path: Array<number>,
    coinInfo: CoinInfo,
    showOnTrezor: boolean,
}
type Params = {
    bundle: Array<Batch>,
    bundledResponse: boolean,
}

export default class GetAddress extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];

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
                { name: 'coin', type: 'string' },
                { name: 'showOnTrezor', type: 'boolean' },
            ]);

            const path: Array<number> = validatePath(batch.path, 3);
            let coinInfo: ?CoinInfo;
            if (batch.coin) {
                coinInfo = getCoinInfoByCurrency(batch.coin);
            }

            if (coinInfo && !batch.crossChain) {
                validateCoinPath(coinInfo, path);
            } else if (!coinInfo) {
                coinInfo = getCoinInfoFromPath(path);
            }

            let showOnTrezor: boolean = true;
            if (batch.hasOwnProperty('showOnTrezor')) {
                showOnTrezor = batch.showOnTrezor;
            }
            if (showOnTrezor) {
                shouldUseUi = true;
            }

            if (!coinInfo) {
                throw NO_COIN_INFO;
            } else if (coinInfo) {
                // set required firmware from coinInfo support
                this.requiredFirmware = getRequiredFirmware(coinInfo, this.requiredFirmware);
            }

            // fix coinInfo network values (segwit/legacy)
            coinInfo = fixCoinInfoNetwork(coinInfo, path);

            bundle.push({
                path,
                coinInfo,
                showOnTrezor,
            });
        });

        // this.useUi = !(!shouldUseUi && bundle.length < 2);
        this.useUi = shouldUseUi;

        // set info
        if (bundle.length === 1) {
            this.info = getLabel('Export #NETWORK address', bundle[0].coinInfo);
        } else {
            const requestedNetworks: Array<?CoinInfo> = bundle.map(b => b.coinInfo);
            const uniqNetworks = uniqBy(requestedNetworks, (ci) => { return ci ? ci.shortcut : null; });
            if (uniqNetworks.length === 1 && uniqNetworks[0]) {
                this.info = getLabel('Export multiple #NETWORK addresses', uniqNetworks[0]);
            } else {
                this.info = 'Export multiple addresses';
            }
        }

        this.params = {
            bundle,
            bundledResponse,
        };
    }

    async run(): Promise<Address | Array<Address>> {
        const responses: Array<Address> = [];
        for (let i = 0; i < this.params.bundle.length; i++) {
            const response:Address = await this.device.getCommands().getAddress(
                this.params.bundle[i].path,
                this.params.bundle[i].coinInfo,
                this.params.bundle[i].showOnTrezor
            );
            responses.push(response);

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
