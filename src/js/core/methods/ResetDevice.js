/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath, getRequiredFirmware } from './helpers/paramsValidator';
import { validatePath } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import { getCoinInfoByCurrency, getCoinInfoFromPath } from '../../data/CoinInfo';
import { getPublicKeyLabel } from '../../utils/pathUtils';
import type { CoinInfo, UiPromiseResponse } from 'flowtype';
import type { HDNodeResponse } from '../../types/trezor';
import type { CoreMessage } from '../../types';

type Batch = {
    path: Array<number>,
    coinInfo: ?CoinInfo,
}
type Params = {
    bundle: Array<Batch>,
    bundledResponse: boolean,
}

export default class GetPublicKey extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['write'];
        this.info = 'Reset device';

        const payload: Object = message.payload;
        // validate bundle type
        // validateParams(payload, [
        //     { name: 'bundle', type: 'array' },
        // ]);

        this.params = {

        };
    }

    async confirmation2(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // const label = getPublicKeyLabel(this.params.path, this.params.coinInfo);
        let label: string;
        if (this.params.bundle.length > 1) {
            label = 'Export multiple public keys';
        } else {
            label = getPublicKeyLabel(this.params.bundle[0].path, this.params.bundle[0].coinInfo);
        }

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-xpub',
            label,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<HDNodeResponse | Array<HDNodeResponse>> {
        return await this.device.getCommands().reset();
    }
}
