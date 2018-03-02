/* @flow */
'use strict';

import Account from '../../account/Account';
import { validatePath, getPathFromIndex } from '../../utils/pathUtils';

import * as UI from '../../constants/ui';
import { UiMessage } from '../CoreMessage';
import type { UiPromiseResponse } from '../CoreMessage';
import type { MethodParams, MethodCallbacks } from './parameters';
import { checkPermissions } from './permissions';

import { discover, stopDiscovering } from '../../account/discovery';

import { getCoinInfoByCurrency, getCoinInfoFromPath, getAccountLabelFromPath, getCoinName, generateCoinInfo } from '../../backend/CoinInfo';
import type { CoinInfo, AccountType } from '../../backend/CoinInfo';
import { HDNode } from 'bitcoinjs-lib-zcash';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    const input: Object = params.input;

    if (input.path) {
        console.log("CoinInfo", input.coinInfo);

        if (input.coinInfo.hashGenesisBlock === "N/A" || true) {
            const { message } = await callbacks.device.getCommands().getPublicKey(input.path);
            return {
                xpub: message.xpub,
                path: message.node.path,
                chainCode: message.node.chain_code,
                publicKey: message.node.public_key
            };
        }



        const node: HDNode = await callbacks.device.getCommands().getHDNode(input.path, input.coinInfo);
        return {
            accountIndex: input.account,
            xpub: node.toBase58(),
            path: input.path,
            input,
        };
    } else {
        // wait for popup window
        await callbacks.getPopupPromise().promise;

        // request account selection view
        callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
            coinInfo: input.coinInfo,
            accounts: [],
        }));

        let accounts: Array<Account> = [];

        const simpleAccount = (account: Account): Object => {
            return {
                id: account.id,
                label: `Account #${account.id + 1}`,
                segwit: account.coinInfo.segwit,
                balance: account.info ? account.info.balance : -1,
                fresh: account.info ? account.info.transactions.length < 1 : false,
            };
        };

        // handle error from async discovery function
        const onStart = (newAccount: Account, allAccounts: Array<Account>): void => {
            const simpleAcc: Array<Object> = [];
            for (const a of allAccounts) {
                simpleAcc.push(simpleAccount(a));
            }
            simpleAcc.push(simpleAccount(newAccount));

            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: input.coinInfo,
                accounts: simpleAcc,
            }));
        };

        const onUpdate = (newAccount: Account, allAccounts: Array<Account>): void => {
            accounts = allAccounts;

            const simpleAcc: Array<Object> = [];
            for (const a of allAccounts) {
                simpleAcc.push(simpleAccount(a));
            }
            // update account selection view
            // callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, allAccounts));
            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: input.coinInfo,
                accounts: simpleAcc,
            }));
        };

        const onComplete = (allAccounts: Array<Account>): void => {
            const simpleAcc: Array<Object> = [];
            for (const a of allAccounts) {
                simpleAcc.push(simpleAccount(a));
            }
            // update account selection view
            // callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, allAccounts));
            callbacks.postMessage(new UiMessage(UI.SELECT_ACCOUNT, {
                coinInfo: input.coinInfo,
                accounts: simpleAcc,
                complete: true,
            }));
        };

        // handle error from async discovery function
        const onError = (error: Error): void => {
            const uiPromise = callbacks.findUiPromise(0, UI.RECEIVE_ACCOUNT);
            if (uiPromise) {
                uiPromise.reject(error);
            }
        };

        // start discovering
        // this method is async but we dont want to stop here and block UI which will happen if we use "await"
        // that's why we use callbacks to update UI or throw error to UiPromise
        discover({
            device: callbacks.device,
            coin: input.coin,
            onStart,
            onUpdate,
            onComplete,
            onError,
        });

        // wait for user action or error from discovery
        const uiResp: UiPromiseResponse = await callbacks.createUiPromise(0, UI.RECEIVE_ACCOUNT).promise;
        const resp: string = uiResp.data;
        const respNumber: number = parseInt(resp);

        // if ui promise reject we need to stop discovering
        stopDiscovering();

        if (!isNaN(respNumber) && accounts[respNumber]) {
            // const coinInfo = callbacks.device
            const selectedAccount: Account = accounts[respNumber];

            // close window
            callbacks.postMessage(new UiMessage(UI.CLOSE_UI_WINDOW));

            return {
                accountIndex: selectedAccount.id,
                xpub: selectedAccount.xpub,
                path: selectedAccount.basePath,
                input,
            };
        } else {
            // TODO:
            console.warn('Selected account not found!', accounts, respNumber);
            throw new Error('Selected account not found!');
        }
    }
};

const confirmation = async (params: MethodParams, callbacks: MethodCallbacks): Promise<boolean> => {
    // confirmation not needed when xpub is requested without path
    // we need to do discovery and let the user pick account
    // or parameter "confirmation" is set to false
    if (!params.input.confirm || !params.input.path) {
        return true;
    }
    // wait for popup window
    await callbacks.getPopupPromise().promise;

    // request confirmation view
    callbacks.postMessage(new UiMessage(UI.REQUEST_CONFIRMATION, {
        view: 'export_xpub',
        accountType: params.input.accountType,
    }));
    // wait for user action
    const uiResp: UiPromiseResponse = await callbacks.createUiPromise(0, UI.RECEIVE_CONFIRMATION).promise;
    const resp: string = uiResp.data;
    return (resp === 'true');
};

const params = (raw: Object): MethodParams => {
    // const permissions: Array<string> = checkPermissions(['read', 'write', 'read-meta', 'write-meta']);
    const permissions: Array<string> = checkPermissions(['read', 'read-meta']);
    const requiredFirmware: string = '1.5.0';

    let path: Array<number>;
    let accountType: AccountType;

    let confirm: boolean = true;
    let coin: string;
    let coinInfo: ?CoinInfo;

    if (raw.path) {
        // get xpub by path
        path = validatePath(raw.path);
        coinInfo = getCoinInfoFromPath(path);
        if (coinInfo) {
            coin = coinInfo.name;
        } else {
            // coin not found in coins.json
            // it could be altcoin or Copay id
            // coin = 'Bitcoin';
            coinInfo = generateCoinInfo(getCoinName(path));
        }
        accountType = getAccountLabelFromPath(coinInfo.label, path, coinInfo.segwit);
    } else {
        // get xpub by account number or from discovery
        coinInfo = getCoinInfoByCurrency(typeof raw.coin === 'string' ? raw.coin : 'Bitcoin');
        if (!coinInfo) {
            throw new Error(`Coin: ${raw.coin} not found`);
        }
        coin = coinInfo.name;

        if (!isNaN(parseInt(raw.account))) {
            let bip44purpose: number = 44;
            if (coinInfo.segwit) {
                bip44purpose = 49;
                if (typeof raw.accountLegacy === 'boolean' && raw.accountLegacy) {
                    bip44purpose = 44;
                    // coinInfo = JSON.parse(JSON.stringify(coinInfo));
                    // coinInfo.network.bip32.public = parseInt(coinInfo.legacyPubMagic, 16);
                }
            }
            path = getPathFromIndex(bip44purpose, coinInfo.bip44, raw.account);
            coinInfo = getCoinInfoFromPath(path); // TODO!!!
            accountType = getAccountLabelFromPath(coinInfo.label, path, coinInfo.segwit);
        }
    }

    if (typeof raw.confirmation === 'boolean') {
        confirm = raw.confirmation;
    }

    let useUi: boolean = true;
    if (path && !confirm && permissions.length < 1) {
        useUi = false;
    }

    return {
        responseID: raw.id,
        name: 'getxpub',
        useUi: useUi,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation,
        method,
        keepSession: raw.keepSession,
        input: {
            path: path,
            confirm: confirm,
            coin: coin,
            accountType: accountType,
            coinInfo: coinInfo,
        },
    };
};

export default {
    method,
    confirmation,
    params,
};
