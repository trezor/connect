/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath } from './helpers/paramsValidator';
import Discovery from './helpers/Discovery';
import * as BLOCKCHAIN from '../../constants/blockchain';
import { NO_COIN_INFO } from '../../constants/errors';

import {
    validatePath,
    getAccountLabel,
    getSerializedPath,
} from '../../utils/pathUtils';
import { create as createDeferred } from '../../utils/deferred';

import Account, { create as createAccount } from '../../account';
import BlockBook, { create as createBackend } from '../../backend';
import { getCoinInfoByCurrency, fixCoinInfoNetwork, getCoinInfoFromPath, getEthereumNetwork } from '../../data/CoinInfo';
import { BlockchainMessage } from '../../message/builder';
import type { CoinInfo, EthereumNetworkInfo, UiPromiseResponse } from 'flowtype';
import type { AccountInfo, HDNodeResponse } from '../../types/trezor';
import type { Deferred, CoreMessage } from '../../types';

type Params = {
    accounts: Array<string>,
    coinInfo: CoinInfo | EthereumNetworkInfo,
}

export default class BlockchainSubscribe extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;
    backend: BlockBook;
    discovery: ?Discovery;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = [];
        this.info = 'Export ethereum account info';
        this.useDevice = false;
        this.useUi = false;

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'accounts', type: 'array', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
        ]);

        const network: ?EthereumNetworkInfo = getEthereumNetwork(payload.coin);
        if (!network) {
            throw NO_COIN_INFO;
        }

        this.params = {
            accounts: payload.accounts,
            coinInfo: network,
        };
    }

    async run(): Promise<{ subscribed: true }> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);

        this.backend.subscribe(
            this.params.accounts,
            block => {
                this.postMessage( new BlockchainMessage(BLOCKCHAIN.BLOCK, {
                    coin: this.params.coinInfo.name,
                    block
                }) );
            },
            error => {
                this.postMessage( new BlockchainMessage(BLOCKCHAIN.ERROR, {
                    coin: this.params.coinInfo.name,
                    error: error.message
                }) );
            }
        );

        console.warn("-----BLOCKBOOK", this.backend.blockchain.blocks)
        // this.backend.blockchain.blocks.values.attach(block => {
        //     console.warn("BLOCK!", block)

        //     // send progress
        //     this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
        //         block
        //     }));
        // });

        // this.backend.blockchain.notifications.values.attach(block => {
        //     console.warn("NOTIF!", block)

        //     // send progress
        //     this.postMessage(new UiMessage(UI.BUNDLE_PROGRESS, {
        //         block
        //     }));
        // });

        // this.backend.blockchain.errors.values.attach(block => {
        //     console.warn("ERROR!", block)
        // });

        // // const { height } = await this.backend.blockchain.lookupSyncStatus();
        // const txs = await this.backend.blockchain.subscribe(new Set(this.params.addresses));
        // //clearInterval(inter);

        return {
            subscribed: true
        };
    }
}
