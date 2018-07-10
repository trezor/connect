/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validatePath, fromHardened } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import type { MessageResponse } from '../../device/DeviceCommands';
import type { NEMAddress } from '../../types/trezor';
import type { UiPromiseResponse } from 'flowtype';
import type { CoreMessage } from '../../types';

type Params = {
    path: Array<number>;
    network: number;
    showOnTrezor: boolean;
}

const MAINNET: number = 0x68;
const TESTNET: number = 0x98;
const MIJIN: number = 0x60;

export default class NEMGetAddress extends AbstractMethod {

    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);

        this.requiredPermissions = ['read'];
        this.info = 'Export NEM address';

        const payload: any = message.payload;

        if (!payload.hasOwnProperty('path')) {
            throw new Error('Parameter "path" is missing');
        } else {
            payload.path = validatePath(payload.path);
        }

        let network: number = 0x68;
        if (payload.hasOwnProperty('network')) {
            if (typeof payload.network !== 'number'){
                throw new Error('Parameter "network" has invalid type. Number expected.');
            } else if (payload.network !== MAINNET && payload.network !== TESTNET && payload.network !== MIJIN) {
                throw new Error('Invalid NEM network. 0x68, 0x98 or 0x60 expected.');
            }
        }

        let showOnTrezor: boolean = true;
        if (payload.hasOwnProperty('showOnTrezor')){
            if (typeof payload.showOnTrezor !== 'boolean') {
                throw new Error('Parameter "showOnTrezor" has invalid type. Boolean expected.');
            } else {
                showOnTrezor = payload.showOnTrezor;
            }
        }



        this.params = {
            path: payload.path,
            network: payload.network,
            showOnTrezor
        }
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        let network: string = 'Unknown';
        switch (this.params.network) {
            case MAINNET :
                network = 'Mainnet';
                break;
            case TESTNET :
                network = 'Testnet';
                break;
            case MIJIN :
                network = 'Mijin';
                break;
        }

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-address',
            label: `Export NEM address for Account#${ (fromHardened(this.params.path[2]) + 1) } on ${ network } network`
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        const resp: string = uiResp.payload;

        this.confirmed = (resp === 'true');
        return this.confirmed;
    }

    async run(): Promise<NEMAddress> {
        const response: MessageResponse<NEMAddress> = await this.device.getCommands().nemGetAddress(
            this.params.path,
            this.params.network,
            this.params.showOnTrezor
        );
        return response.message;
    }
}
