/* @flow */
'use strict';

import { getIndexFromPath } from '../utils/pathUtils';

import type { AccountInfo } from 'hd-wallet';
import type { CoinInfo, SimpleAccount } from 'flowtype';

export default class Account {
    id: number;
    path: Array<number>;
    xpub: string;
    coinInfo: CoinInfo;
    info: ?AccountInfo;
    transactions: number = 0; // loading status

    constructor(
        path: Array<number>,
        xpub: string,
        coinInfo: CoinInfo,
    ) {
        this.id = getIndexFromPath(path);
        this.path = path;
        this.coinInfo = coinInfo;
        this.xpub = xpub;
    }

    isUsed() {
        return (this.info && this.info.transactions.length > 0);
    }

    getPath(): Array<number> {
        return this.path;
    }

    getNextAddress(): string {
        return this.info ? this.info.unusedAddresses[0] : 'unknown';
    }

    getNextAddressId(): number {
        return this.info ? this.info.usedAddresses.length : -1;
    }

    getChangeIndex(): number {
        return this.info ? this.info.changeIndex : 0;
    }

    getNextChangeAddress(): string {
        return this.info ? this.info.changeAddresses[ this.info.changeIndex ] : 'unknown';
    }

    getAddressPath(address: string): Array<number> {
        if (!this.info) return this.path;
        const addresses = this.info.usedAddresses.concat(this.info.unusedAddresses);
        const index = addresses.indexOf(address);
        return this.path.concat([0, index]);
    }

    getBalance(): number {
        return this.info ? this.info.balance : 0;
    }

    getConfirmedBalance(): number {
        if (!this.info) return 0;
        return this.info.balance;
    }

    getUtxos(): Array<any> {
        return this.info ? this.info.utxos : [];
    }

    toMessage(): SimpleAccount {
        return {
            id: this.id,
            path: this.path,
            coinInfo: this.coinInfo,
            xpub: this.xpub,
            label: `Account #${this.id + 1}`,
            balance: this.info ? this.info.balance : -1,
            transactions: this.info ? this.info.transactions.length : this.transactions,
        };
    }
}
