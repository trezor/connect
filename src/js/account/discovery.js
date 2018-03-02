/* @flow */
'use strict';

import Device from '../device/Device';
import DeviceCommands from '../device/DeviceCommands';
import BitcoreBackend, { create as createBackend } from '../backend/BitcoreBackend';
import Account from './Account';
import { getPathFromIndex } from '../utils/pathUtils';
import type { CoinInfo } from '../backend/CoinInfo';
import { HDNode } from 'bitcoinjs-lib-zcash';

let interrupted: boolean = false;
export const stopDiscovering = () => {
    interrupted = true;
};

export type DiscoveryOptions = {
    device: Device,
    backend?: BitcoreBackend,
    coin?: string,
    coinInfo?: CoinInfo,
    discoverLegacyAccounts?: boolean,
    legacyAddressOnSegwit?: boolean,
    accounts?: Array<Account>,
    discoveryLimit?: number,
    onStart: (newAccount: Account, allAccounts: Array<Account>) => void,
    onUpdate: (newAccount: Account, allAccounts: Array<Account>) => void,
    onComplete: (allAccounts: Array<Account>) => void,
    onError: (error: Error) => void,
}

export const discover = async (options: DiscoveryOptions): Promise<Array<Account> | void> => {
    interrupted = false;

    let startIndex: number = 0;
    let backend: BitcoreBackend;
    // local copy of CoinInfo
    let coinInfo: CoinInfo;
    let accounts: Array<Account> = [];

    if (options.accounts && Array.isArray(options.accounts)) {
        // last account
        accounts = options.accounts;
        const lastDiscoveredAccount: Account = accounts[ options.accounts.length - 1 ];
        backend = lastDiscoveredAccount.backend;
        coinInfo = { ...lastDiscoveredAccount.coinInfo };
        if (lastDiscoveredAccount.info && lastDiscoveredAccount.info.transactions.length < 1) {
            coinInfo.segwit = false;
            startIndex = 0;
        } else {
            startIndex = lastDiscoveredAccount.id + 1;
        }
    } else if (options.backend) {
        backend = options.backend;
        coinInfo = { ...backend.coinInfo };
    } else if (options.coinInfo) {
        backend = await createBackend(options.coinInfo);
        //coinInfo = { ...backend.coinInfo };
        coinInfo = { ...options.coinInfo };
    } else if (options.coin) {
        backend = await createBackend(options.coin);
        coinInfo = { ...backend.coinInfo };
    } else {
        throw new Error('Neither backend or coin is not set');
    }

    const discoveryLimit: number = typeof options.discoveryLimit === 'number' ? options.discoveryLimit : 0;
    const discoverLegacyAccounts: boolean = typeof options.discoverLegacyAccounts === 'boolean' ? options.discoverLegacyAccounts : true;

    const device: Device = options.device;
    const comm: DeviceCommands = device.getCommands();

    // check if not interrupted
    if (comm.isDisposed() || interrupted) return;

    const loop = async (index: number): Promise<Array<Account>> => {
        // check if not interrupted
        if (comm.isDisposed() || interrupted) return accounts;

        const path: Array<number> = getPathFromIndex(coinInfo.segwit ? 49 : 44, coinInfo.bip44, index);
        const node: HDNode = await comm.getHDNode(path, coinInfo);
        const account: Account = new Account(index, path, node.toBase58(), backend, coinInfo);

        // check if not interrupted
        if (comm.isDisposed() || interrupted) return accounts;

        // publish result
        options.onStart(account, accounts);

        // cornercase: segwit xpub scanned by mycellium (1 address)
        if (options.legacyAddressOnSegwit) { account.coinInfo.segwit = false; }

        const discovered: Account = await account.discover(); // TODO: pass saved state (localstorage) to method

        if (comm.isDisposed() || interrupted) return accounts;

        // publish result
        accounts.push(discovered);
        options.onUpdate(discovered, accounts);

        if (discovered.info.transactions.length > 0 || discovered.info.utxos.length > 0 || index < discoveryLimit) {
            return loop(index + 1);
        } else {
            // discovered account is fresh
            if (coinInfo.segwit && discoverLegacyAccounts) {
                coinInfo.segwit = false;
                coinInfo.network.bip32.public = parseInt(coinInfo.legacyPubMagic, 16); // TODO: this changes permanently TO FIX!!!!, make CoiniInfo read only array
                return loop(0);
            } else {
                options.onComplete(accounts);
                return accounts;
            }
        }
    };

    try {
        return await loop(startIndex);
    } catch (error) {
        options.onError(error);
    }
};
