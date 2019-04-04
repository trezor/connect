/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams } from './helpers/paramsValidator';
import { getEthereumNetwork } from '../../data/CoinInfo';
import Discovery from './helpers/Discovery';
import { NO_COIN_INFO } from '../../constants/errors';

import { create as createBackend } from '../../backend/BlockchainLink';
import type { CoreMessage, EthereumNetworkInfo } from '../../types';
import type { EthereumAccount } from '../../types/account';

type Params = {
    accounts: Array<EthereumAccount>,
    coinInfo: EthereumNetworkInfo,
    pageSize: number,
    details: string,
    page: number | string,
    bundledResponse: boolean,
}

export default class EthereumGetAccountInfo extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;
    discovery: ?Discovery;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.info = 'Export ethereum account info';
        this.useDevice = false;
        this.useUi = false;

        const payload: Object = message.payload;
        let bundledResponse: boolean = true;
        // create a bundle with only one batch
        if (!payload.hasOwnProperty('accounts')) {
            payload.accounts = [ ...payload.account ];
            bundledResponse = false;
        }

        // validate incoming parameters
        validateParams(payload, [
            { name: 'accounts', type: 'array', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'details', type: 'string' },
            { name: 'pageSize', type: 'number' },
        ]);

        payload.accounts.forEach(batch => {
            validateParams(batch, [
                { name: 'descriptor', type: 'string', obligatory: true },
            ]);
        });

        const network: ?EthereumNetworkInfo = getEthereumNetwork(payload.coin);
        if (!network) {
            throw NO_COIN_INFO;
        }

        this.params = {
            accounts: payload.accounts,
            details: payload.details,
            pageSize: payload.pageSize,
            page: payload.page,
            coinInfo: network,
            bundledResponse,
        };
    }

    async run(): Promise<EthereumAccount | Array<EthereumAccount>> {
        const blockchain = await createBackend(this.params.coinInfo, this.postMessage);
        const responses: Array<EthereumAccount> = [];

        for (let i = 0; i < this.params.accounts.length; i++) {
            const account = this.params.accounts[i];
            const freshInfo = await blockchain.getAccountInfo({
                descriptor: account.descriptor,
                details: this.params.details,
                page: this.params.page,
                pageSize: this.params.pageSize,
            });

            const info = {
                ...account,
                ...freshInfo,
            };
            responses.push(info);
        }
        return this.params.bundledResponse ? responses : responses[0];
    }
}
