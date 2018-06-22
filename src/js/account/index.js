/* @flow */
'use strict';

import Account from './Account';
import BlockBook from '../backend/BitcoreBackend';
import type { CoinInfo } from 'flowtype';

const accounts: Array<Account> = [];

export const create = (path: Array<number>, xpub: string, coinInfo: CoinInfo): Account => {
    // TODO check existence
    const account: Account = new Account(path, xpub, coinInfo);
    accounts.push(account);
    return account;
}

export default Account;
