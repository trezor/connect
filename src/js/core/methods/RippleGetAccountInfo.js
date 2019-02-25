/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { validatePath, getSerializedPath } from '../../utils/pathUtils';
import { getMiscNetwork } from '../../data/CoinInfo';
import { NO_COIN_INFO } from '../../constants/errors';

import * as UI from '../../constants/ui';
import { UiMessage } from '../../message/builder';

import { create as createBackend } from '../../backend/BlockchainLink';

import type { CoreMessage, MiscNetworkInfo } from '../../types';
import type { RippleAccount } from '../../types/account';

type Params = {
    accounts: Array<RippleAccount>,
    level: string,
    coinInfo: MiscNetworkInfo,
    bundledResponse: boolean,
}

export default class RippleGetAccountInfo extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read'];
        this.firmwareRange = getFirmwareRange(this.name, getMiscNetwork('Ripple'), this.firmwareRange);
        this.info = 'Export ripple account info';
        this.useDevice = true;
        this.useUi = false;

        const payload: Object = message.payload;
        let bundledResponse: boolean = true;
        let willUseDevice: boolean = false;
        // create a bundle with only one batch
        if (!payload.hasOwnProperty('bundle')) {
            payload.bundle = [ ...payload.account ];
            bundledResponse = false;
        }

        // validate incoming parameters
        validateParams(payload, [
            { name: 'bundle', type: 'array', obligatory: true },
            { name: 'level', type: 'string' },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        payload.bundle.forEach(batch => {
            validateParams(batch, [
                { name: 'descriptor', type: 'string' },
                { name: 'path', type: 'string' },
                { name: 'block', type: 'number' },
                { name: 'transactions', type: 'number' },
                { name: 'mempool', type: 'boolean' },
                { name: 'history', type: 'boolean' },
            ]);
            if (!batch.path && !batch.descriptor) {
                throw new Error('"path" or "descriptor" field is missing in account');
            }
            // validate path if exists
            if (batch.path) {
                batch.path = validatePath(batch.path, 5);
                willUseDevice = true;
            }
        });

        const network: ?MiscNetworkInfo = getMiscNetwork(payload.coin);
        if (!network) {
            throw NO_COIN_INFO;
        }

        this.useDevice = willUseDevice;

        this.params = {
            accounts: payload.bundle,
            level: payload.level,
            coinInfo: network,
            bundledResponse,
        };
    }

    async run(): Promise<RippleAccount | Array<RippleAccount>> {
        // initialize backend
        const blockchain = await createBackend(this.params.coinInfo, this.postMessage);

        const responses: Array<RippleAccount> = [];

        for (let i = 0; i < this.params.accounts.length; i++) {
            const account = this.params.accounts[i];
            const { path } = account;
            if (path && !account.descriptor) {
                const rippleAddress = await this.device.getCommands().rippleGetAddress(
                    path,
                    false
                );
                account.descriptor = rippleAddress.address;
                account.serializedPath = getSerializedPath(path);
            }

            const freshInfo = await blockchain.getAccountInfo(account.descriptor, {
                level: this.params.level,
                from: account.block,
            });
            const info = {
                ...account,
                ...freshInfo,
            };
            responses.push(info);

            if (this.params.bundledResponse) {
                // send progress
                this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
                    progress: i,
                    response: info,
                }));
            }
        }
        return this.params.bundledResponse ? responses : responses[0];
    }
}
