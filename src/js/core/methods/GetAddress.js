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
import type { CoinInfo, UiPromiseResponse } from 'flowtype';
import type { CoreMessage } from '../../types';

type Batch = {
    path: Array<number>,
    address: ?string,
    coinInfo: CoinInfo,
    showOnTrezor: boolean,
}

type Params = Array<Batch>;

export default class GetAddress extends AbstractMethod {
    confirmed: boolean = false;
    params: Params;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];

        // create a bundle with only one batch
        const payload: Object = !message.payload.hasOwnProperty('bundle') ? { ...message.payload, bundle: [ ...message.payload ] } : message.payload;

        // validate bundle type
        validateParams(payload, [
            { name: 'bundle', type: 'array' },
            { name: 'useEventListener', type: 'boolean' },
        ]);

        const bundle = [];
        payload.bundle.forEach(batch => {
            // validate incoming parameters for each batch
            validateParams(batch, [
                { name: 'path', obligatory: true },
                { name: 'coin', type: 'string' },
                { name: 'address', type: 'string' },
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
                address: batch.address,
                coinInfo,
                showOnTrezor,
            });
        });

        const useEventListener = payload.useEventListener && payload.bundle.length === 1 && typeof payload.bundle[0].address === 'string' && payload.bundle[0].showOnTrezor;
        this.confirmed = useEventListener;
        this.useUi = !useEventListener;

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

        this.params = bundle;
    }

    // getButtonRequestData(code: string) {
    //     if (code === 'ButtonRequest_Address' && this.params.length === 1) {
    //         const data = [];
    //         for (let i = 0; i < this.params.length; i++) {
    //             data.push({
    //                 serializedPath: getSerializedPath(this.params[i].path),
    //                 address: this.params[i].address || 'not-set',
    //             });
    //         }
    //         return data;
    //     }
    //     return null;
    // }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        const label: string = this.info;
        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-address',
            label,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<Address | Array<Address>> {
        const responses: Array<Address> = [];
        const bundledResponse = this.params.length > 1;

        if (!bundledResponse) {
            // silently get address and compare with requested address
            // or display as default inside popup
            const item = this.params[0];
            const response: Address = await this.device.getCommands().getAddress(
                item.path,
                item.coinInfo,
                false
            );
            if (typeof item.address === 'string') {
                if (item.address !== response.address) {
                    throw new Error('Addresses do not match');
                }
            } else {
                this.params[0].address = response.address;
            }
        }

        for (let i = 0; i < this.params.length; i++) {
            const response:Address = await this.device.getCommands().getAddress(
                this.params[i].path,
                this.params[i].coinInfo,
                this.params[i].showOnTrezor
            );
            responses.push(response);

            if (bundledResponse) {
                // send progress
                this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response,
                }));
            }
        }
        return bundledResponse ? responses : responses[0];
    }
}
