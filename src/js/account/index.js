/* @flow */

import Account from './Account';
import type { BitcoinNetworkInfo } from '../types';
import type { HDNodeResponse } from '../types/trezor';

const accounts: Array<Account> = [];

export const create = (path: Array<number>, node: HDNodeResponse, coinInfo: BitcoinNetworkInfo): Account => {
    // TODO check existence
    const account: Account = new Account(path, node, coinInfo);
    accounts.push(account);
    return account;
};

export const remove = (account: Account): void => {
    const index: number = accounts.indexOf(account);
    if (index >= 0) {
        accounts.splice(index, 1);
    }
};

export default Account;
