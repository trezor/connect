/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import Discovery from './helpers/Discovery';
import * as UI from '../../constants/ui';
import { getCoinInfoByCurrency } from '../../data/CoinInfo';
import { validateParams } from './helpers/paramsValidator';
import { resolveAfter } from '../../utils/promiseUtils';
import { formatAmount } from '../../utils/formatUtils';
import { NO_COIN_INFO } from '../../constants/errors';

import BlockBook, { create as createBackend } from '../../backend';
import Account from '../../account';
import TransactionComposer from './tx/TransactionComposer';
import {
    validateHDOutput,
    inputToTrezor,
    outputToTrezor,
    getReferencedTransactions,
    transformReferencedTransactions,
} from './tx';
import * as helper from './helpers/signtx';

import { UiMessage } from '../../message/builder';

import type { CoinInfo, UiPromiseResponse } from 'flowtype';
import type { CoreMessage } from '../../types';
import type { SignedTx } from '../../types/trezor';

import type {
    BuildTxOutputRequest,
    BuildTxResult,
} from 'hd-wallet';

type Params = {
    outputs: Array<BuildTxOutputRequest>,
    coinInfo: CoinInfo,
    push: boolean,
}

export default class ComposeTransaction extends AbstractMethod {
    params: Params;
    backend: BlockBook;
    discovery: ?Discovery;
    composer: TransactionComposer;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];

        const payload: Object = message.payload;
        // validate incoming parameters
        validateParams(payload, [
            { name: 'outputs', type: 'array', obligatory: true },
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'push', type: 'boolean' },
        ]);

        const coinInfo: ?CoinInfo = getCoinInfoByCurrency(payload.coin);
        if (!coinInfo) {
            throw NO_COIN_INFO;
        }

        // set required firmware from coinInfo support
        this.requiredFirmware = [ coinInfo.support.trezor1, coinInfo.support.trezor2 ];

        // validate each output and transform into hd-wallet format
        const outputs: Array<BuildTxOutputRequest> = [];
        let total: number = 0;
        payload.outputs.forEach(out => {
            const output = validateHDOutput(out, coinInfo);
            if (typeof output.amount === 'number') {
                total += output.amount;
            }
            outputs.push(output);
        });

        const sendMax: boolean = outputs.find(o => o.type === 'send-max') !== undefined;

        // there should be only one output when using send-max option
        if (sendMax && outputs.length > 1) {
            throw new Error('Only one output allowed when using "send-max" option.');
        }

        // if outputs contains regular items
        // check if total amount is not lower than dust limit
        if (outputs.find(o => o.type === 'complete') !== undefined && total <= coinInfo.dustLimit) {
            throw new Error('Total amount is too low.');
        }

        if (sendMax) {
            this.info = 'Send maximum amount';
        } else {
            this.info = `Send ${ formatAmount(total, coinInfo) }`;
        }

        this.params = {
            outputs,
            coinInfo,
            push: payload.hasOwnProperty('push') ? payload.push : false,
        };
    }

    async run(): Promise<SignedTx> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);

        // discover accounts and wait for user action
        const account = await this._getAccount();
        if (account instanceof Account) {
            // wait for fee selection
            const response: string | SignedTx = await this._getFee(account);
            if (typeof response === 'string') {
                // back to account selection
                return await this.run();
            } else {
                return response;
            }
        } else {
            throw new Error(account.error);
        }
    }

    async _getAccount(): Promise<Account | { error: string }> {
        const discovery: Discovery = this.discovery || new Discovery({
            getHDNode: this.device.getCommands().getHDNode.bind(this.device.getCommands()),
            coinInfo: this.params.coinInfo,
            backend: this.backend,
        });

        discovery.on('update', (accounts: Array<Account>) => {
            this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: this.params.coinInfo,
                accounts: accounts.map(a => a.toMessage()),
                checkBalance: true,
            }));
        });

        discovery.on('complete', (accounts: Array<Account>) => {
            this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: this.params.coinInfo,
                accounts: accounts.map(a => a.toMessage()),
                checkBalance: true,
                complete: true,
            }));
        });

        if (!this.discovery) {
            this.discovery = discovery;
        }
        discovery.start();

        // set select account view
        // this view will be updated from discovery events
        this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            coinInfo: this.params.coinInfo,
            accounts: discovery.accounts.map(a => a.toMessage()),
            checkBalance: true,
            start: true,
            complete: discovery.completed,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_ACCOUNT, this.device).promise;
        discovery.removeAllListeners();
        discovery.stop();

        const resp: number = parseInt(uiResp.payload);
        return discovery.accounts[resp];
    }

    async _getFee(account: Account): Promise<string | SignedTx> {
        if (this.composer) { this.composer.dispose(); }

        const composer: TransactionComposer = new TransactionComposer(account, this.params.outputs);
        await composer.init(this.backend);
        this.composer = composer;

        const hasFunds: boolean = await composer.composeAllFeeLevels();
        if (!hasFunds) {
            // show error view
            this.postMessage(new UiMessage(UI.INSUFFICIENT_FUNDS));
            // wait few seconds...
            await resolveAfter(2000, null);
            // and go back to discovery
            return 'change-account';
        }

        // set select account view
        // this view will be updated from discovery events
        this.postMessage(new UiMessage(UI.SELECT_FEE, {
            feeLevels: composer.getFeeLevelList(),
            coinInfo: this.params.coinInfo,
        }));

        // wait for user action
        // const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_FEE, this.device).promise;
        return await this._selectFeeUiResponse();
    }

    async _selectFeeUiResponse(): Promise<string | SignedTx> {
        const resp = await this.createUiPromise(UI.RECEIVE_FEE, this.device).promise;
        switch (resp.payload.type) {
            case 'compose-custom':
                // recompose custom fee level with requested value
                this.postMessage(new UiMessage(UI.UPDATE_CUSTOM_FEE, {
                    level: this.composer.composeCustomFee(resp.payload.value),
                    coinInfo: this.params.coinInfo,
                }));

                // wait for user action
                return await this._selectFeeUiResponse();

            case 'send':
                return await this._send(resp.payload.value);

            case 'change-account':
            default:
                return 'change-account';
        }
    }

    async _send(feeLevel: string): Promise<SignedTx> {
        const tx: BuildTxResult = this.composer.composed[feeLevel];

        if (tx.type !== 'final') throw new Error('Trying to sign unfinished tx');

        const bjsRefTxs = await this.backend.loadTransactions(getReferencedTransactions(tx.transaction.inputs));
        const refTxs = transformReferencedTransactions(bjsRefTxs);

        const coinInfo: CoinInfo = this.composer.account.coinInfo;

        const response = await helper.signTx(
            this.device.getCommands().typedCall.bind(this.device.getCommands()),
            tx.transaction.inputs.map(inp => inputToTrezor(inp, 0)),
            tx.transaction.outputs.sorted.map(out => outputToTrezor(out, coinInfo)),
            refTxs,
            coinInfo,
        );

        if (this.params.push) {
            const txid: string = await this.backend.sendTransactionHex(response.serializedTx);
            return {
                ...response,
                txid,
            };
        }

        return response;
    }

    dispose() {
        if (this.discovery) {
            const d = this.discovery;
            d.stop();
            d.removeAllListeners();
        }

        if (this.composer) {
            this.composer.dispose();
        }
    }
}
