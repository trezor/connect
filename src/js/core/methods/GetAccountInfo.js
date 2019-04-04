/* @flow */

import AbstractMethod from './AbstractMethod';
import { validateParams, validateCoinPath, getFirmwareRange } from './helpers/paramsValidator';
import Discovery from './helpers/Discovery';
import * as UI from '../../constants/ui';
import { NO_COIN_INFO } from '../../constants/errors';

import {
    validatePath,
    getAccountLabel,
    getSerializedPath,
} from '../../utils/pathUtils';
import { create as createDeferred } from '../../utils/deferred';

import Account, { create as createAccount } from '../../account';
import BlockBook, { create as createBackend } from '../../backend';
import { getBitcoinNetwork, fixCoinInfoNetwork } from '../../data/CoinInfo';
import { UiMessage } from '../../message/builder';
import type { HDNodeResponse } from '../../types/trezor';
import type { Deferred, CoreMessage, UiPromiseResponse, BitcoinNetworkInfo } from '../../types';
import type { AccountInfoPayload } from '../../types/response';

type Params = {
    path: ?Array<number>,
    xpub: ?string,
    coinInfo: BitcoinNetworkInfo,
}

export default class GetAccountInfo extends AbstractMethod {
    params: Params;
    confirmed: boolean = false;
    backend: BlockBook;
    discovery: ?Discovery;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read'];
        this.info = 'Export account info';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string' },
            { name: 'xpub', type: 'string' },
            { name: 'crossChain', type: 'boolean' },
        ]);

        let path: Array<number>;
        let coinInfo: ?BitcoinNetworkInfo;
        if (payload.coin) {
            coinInfo = getBitcoinNetwork(payload.coin);
        }

        if (payload.path) {
            path = validatePath(payload.path, 3, true);
            if (!coinInfo) {
                coinInfo = getBitcoinNetwork(path);
            } else if (!payload.crossChain) {
                validateCoinPath(coinInfo, path);
            }
        }

        // if there is no coinInfo at this point return error
        if (!coinInfo) {
            throw NO_COIN_INFO;
        } else {
            // check required firmware with coinInfo support
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
        }

        this.params = {
            path,
            xpub: payload.xpub,
            coinInfo,
        };
    }

    async confirmation(): Promise<boolean> {
        if (this.confirmed) return true;
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        let label: string;
        if (this.params.path) {
            label = getAccountLabel(this.params.path, this.params.coinInfo);
        } else if (this.params.xpub) {
            label = `Export ${ this.params.coinInfo.label } account for public key <span>${ this.params.xpub }</span>`;
        } else {
            return true;
        }

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'export-account-info',
            label,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;

        this.confirmed = uiResp.payload;
        return this.confirmed;
    }

    async noBackupConfirmation(): Promise<boolean> {
        // wait for popup window
        await this.getPopupPromise().promise;
        // initialize user response promise
        const uiPromise = this.createUiPromise(UI.RECEIVE_CONFIRMATION, this.device);

        // request confirmation view
        this.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
            view: 'no-backup',
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await uiPromise.promise;
        return uiResp.payload;
    }

    async run(): Promise<Response> {
        // initialize backend
        this.backend = await createBackend(this.params.coinInfo);

        if (this.params.path) {
            return await this._getAccountFromPath(this.params.path);
        } else if (this.params.xpub) {
            return await this._getAccountFromPublicKey();
        } else {
            return await this._getAccountFromDiscovery();
        }
    }

    // xpub6DExuxjQ16sWy5TF4KkLV65YGqCJ5pyv7Ej7d9yJNAXz7C1M9intqszXfaNZG99KsDJdQ29wUKBTZHZFXUaPbKTZ5Z6f4yowNvAQ8fEJw2G s1
    // xpub6D1weXBcFAo8CqBbpP4TbH5sxQH8ZkqC5pDEvJ95rNNBZC9zrKmZP2fXMuve7ZRBe18pWQQsGg68jkq24mZchHwYENd8cCiSb71u3KD4AFH l1

    async _getAccountFromPath(path: Array<number>): Promise<AccountInfoPayload> {
        const coinInfo: BitcoinNetworkInfo = fixCoinInfoNetwork(this.params.coinInfo, path);
        const node: HDNodeResponse = await this.device.getCommands().getHDNode(path, coinInfo);
        const account = createAccount(path, node, coinInfo);

        const discovery: Discovery = this.discovery = new Discovery({
            getHDNode: this.device.getCommands().getHDNode.bind(this.device.getCommands()),
            coinInfo,
            backend: this.backend,
            loadInfo: false,
        });

        await discovery.getAccountInfo(account);
        return this._response(account);
    }

    async _getAccountFromPublicKey(): Promise<AccountInfoPayload> {
        const discovery: Discovery = this.discovery = new Discovery({
            getHDNode: this.device.getCommands().getHDNode.bind(this.device.getCommands()),
            coinInfo: this.params.coinInfo,
            backend: this.backend,
            loadInfo: false,
        });

        const xpub = this.params.xpub || 'unknown';
        const deferred: Deferred<AccountInfoPayload> = createDeferred('account_discovery');
        discovery.on('update', async (accounts: Array<Account>) => {
            const account = accounts.find(a => a.xpub === xpub || a.xpubSegwit === xpub);
            if (account) {
                discovery.removeAllListeners();
                discovery.completed = true;

                await discovery.getAccountInfo(account);
                discovery.stop();
                deferred.resolve(this._response(account));
            }
        });
        discovery.on('complete', () => {
            deferred.reject(new Error(`Account with xpub ${xpub} not found on device ${this.device.features.label}`));
        });

        discovery.start();

        return await deferred.promise;
    }

    async _getAccountFromDiscovery(): Promise<AccountInfoPayload> {
        const discovery: Discovery = this.discovery = new Discovery({
            getHDNode: this.device.getCommands().getHDNode.bind(this.device.getCommands()),
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
                complete: true,
            }));
        });

        try {
            discovery.start();
        } catch (error) {
            throw error;
        }

        // set select account view
        // this view will be updated from discovery events
        this.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            coinInfo: this.params.coinInfo,
            accounts: [],
            start: true,
        }));

        // wait for user action
        const uiResp: UiPromiseResponse = await this.createUiPromise(UI.RECEIVE_ACCOUNT, this.device).promise;
        discovery.stop();

        const resp: number = parseInt(uiResp.payload);
        const account = discovery.accounts[resp];

        return this._response(account);
    }

    _response(account: Account): AccountInfoPayload {
        const nextAddress: string = account.getNextAddress();
        const info = {
            id: account.id,
            path: account.path,
            serializedPath: getSerializedPath(account.path),
            address: nextAddress,
            addressIndex: account.getNextAddressId(),
            addressPath: account.getAddressPath(nextAddress),
            addressSerializedPath: getSerializedPath(account.getAddressPath(nextAddress)),
            xpub: account.xpub,
            xpubSegwit: account.xpubSegwit,
            balance: account.getBalance(),
            confirmed: account.getConfirmedBalance(),
            transactions: account.getTransactionsCount(),
            utxo: account.getUtxos(),
            usedAddresses: account.getUsedAddresses(),
            unusedAddresses: account.getUnusedAddresses(),
        };
        if (typeof info.xpubSegwit !== 'string') {
            delete info.xpubSegwit;
        }

        return info;
    }

    dispose() {
        if (this.discovery) {
            const d = this.discovery;
            d.stop();
            d.removeAllListeners();
        }
    }
}
