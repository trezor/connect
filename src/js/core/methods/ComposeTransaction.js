/* @flow */
'use strict';

import AbstractMethod from './AbstractMethod';
import Discovery from './helpers/Discovery';
import * as UI from '../../constants/ui';
import { getCoinInfoByCurrency } from '../../data/CoinInfo';
import { validatePath } from '../../utils/pathUtils';
import { resolveAfter } from '../../utils/promiseUtils';

import BlockBook, { create as createBackend } from '../../backend';
import Account from '../../account';
import TransactionComposer from './tx/TransactionComposer';
import {
    input as transformInput,
    output as transformOutput
} from './tx/trezorFormat';
import {
    validateOutput
} from './tx/hdFormat';

import * as helper from './helpers/signtx';
import {
    validateInputs,
    validateOutputs,
    getReferencedTransactions,
    transformReferencedTransactions
} from './tx';
import { UiMessage } from '../CoreMessage';

import type { CoinInfo, UiPromiseResponse } from 'flowtype';
import type { Deferred, CoreMessage } from '../../types';
import type { TransactionInput, TransactionOutput, SignedTx } from '../../types/trezor';

import type {
    BuildTxOutputRequest,
    BuildTxInput,
    BuildTxOutput,
    BuildTxResult
} from 'hd-wallet';

type Params = {
    outputs: Array<BuildTxOutputRequest>;
    coinInfo: CoinInfo;
}

export default class ComposeTransaction extends AbstractMethod {

    params: Params;
    backend: BlockBook;
    discovery: ?Discovery;
    composer: TransactionComposer;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.requiredFirmware = '1.6.0';
        this.useDevice = true;
        this.useUi = true;
        this.info = 'Payment request';

        const payload: any = message.payload;
        if (!payload.hasOwnProperty('outputs')) {
            throw new Error('Parameter "outputs" is missing');
        } else if (!Array.isArray(payload.outputs)) {
            throw new Error('Parameter "outputs" has invalid type. Array of BuildTxOutputRequest expected.');
        }

        let coinInfo: ?CoinInfo;
        if (!payload.hasOwnProperty('coin')) {
            throw new Error('Parameter "coin" is missing');
        } else {
            if (typeof payload.coin === 'string') {
                coinInfo = getCoinInfoByCurrency(payload.coin);
            } else {
                throw new Error('Parameter "coin" has invalid type. String expected.');
            }
        }

        if (!coinInfo) {
            throw new Error('Coin not found');
        }

        const outputs: Array<BuildTxOutputRequest> = payload.outputs.map(out => validateOutput(out));

        this.params = {
            outputs,
            coinInfo,
        }
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
            getHDNode: this.device.getCommands().getHDNode.bind( this.device.getCommands() ),
            coinInfo: this.params.coinInfo,
            backend: this.backend,
        });

        discovery.on('update', (accounts: Array<Account>) => {
            this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: this.params.coinInfo,
                accounts: accounts.map(a => a.toMessage()),
            }));
        });

        discovery.on('complete', (accounts: Array<Account>) => {
            this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: this.params.coinInfo,
                accounts: accounts.map(a => a.toMessage()),
                complete: true
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
            start: true,
            complete: discovery.completed
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_ACCOUNT, this.device).promise;
        discovery.removeAllListeners();
        discovery.stop();

        const resp: number = parseInt(uiResp.payload);
        return discovery.accounts[resp];
    }

    async _getFee(account: Account): Promise<string | SignedTx> {

        if (this.composer)
            this.composer.dispose();

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
            coinInfo: this.params.coinInfo
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
                    coinInfo: this.params.coinInfo
                }));

                // wait for user action
                return await this._selectFeeUiResponse();

            case 'send':
                return await this._send(resp.payload.value);

            case 'change-account':
            default:
                return 'change-account'

        }
    }

    async _send(feeLevel: string): Promise<SignedTx> {

        const tx: BuildTxResult = this.composer.composed[feeLevel];

        if (tx.type !== 'final') throw new Error('TODO: trying to sign unfinished tx');

        const bjsRefTxs = await this.backend.loadTransactions( getReferencedTransactions(tx.transaction.inputs) );
        const refTxs = transformReferencedTransactions(bjsRefTxs);

        const coinInfo: CoinInfo = this.composer.account.coinInfo;

        const response = await helper.signTx(
            this.device.getCommands().typedCall.bind( this.device.getCommands() ),
            tx.transaction.inputs.map(inp => transformInput(inp, 0)),
            tx.transaction.outputs.sorted.map(out => transformOutput(out, coinInfo)),
            refTxs,
            coinInfo,
        );

        //const txid: string = await this.backend.sendTransactionHex(response.message.serialized.serialized_tx);

        return {
            ...response.message,
            //txid
        }

        // try {
        //     txId = await this.backend.sendTransactionHex(signedtx.message.serialized.serialized_tx);
        // } catch (error) {
        //     throw {
        //         // custom: true,
        //         error: error.message || error,
        //         // ...signedtx.message.serialized,
        //     };
        // }
        // return {
        //     serialized: {
        //         serialized_tx: 'a',
        //         signatures: ['a'],
        //     }
        // }
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
