/* @flow */

import { getIndexFromPath } from '../utils/pathUtils';

import type { AccountInfo } from 'hd-wallet';
import type { BitcoinNetworkInfo } from '../types';
import type { BitcoinAccount } from '../types/account';
import type { HDNodeResponse } from '../types/trezor';

export default class Account {
    id: number;
    path: Array<number>;
    xpub: string;
    xpubSegwit: ?string;
    coinInfo: BitcoinNetworkInfo;
    info: ?AccountInfo;
    transactions: number = 0; // loading status

    constructor(
        path: Array<number>,
        node: HDNodeResponse,
        coinInfo: BitcoinNetworkInfo,
    ) {
        this.id = getIndexFromPath(path);
        this.path = path;
        this.coinInfo = coinInfo;
        this.xpub = node.xpub;
        this.xpubSegwit = node.xpubSegwit;
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

    getUsedAddresses(): $ElementType<AccountInfo, 'usedAddresses'> {
        return this.info ? this.info.usedAddresses : [];
    }

    getUnusedAddresses(): $ElementType<AccountInfo, 'unusedAddresses'> {
        return this.info ? this.info.unusedAddresses : [];
    }

    getTransactionsCount(): number {
        return this.info ? this.info.transactions.length : this.transactions;
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

    getBalance(): string {
        return this.info ? this.info.balance : '0';
    }

    getConfirmedBalance(): string {
        return this.info ? this.info.balance : '0';
    }

    getUtxos(): Array<any> {
        return this.info ? this.info.utxos : [];
    }

    toMessage(): BitcoinAccount {
        const account: BitcoinAccount = {
            id: this.id,
            path: this.path,
            coinInfo: this.coinInfo,
            xpub: this.xpub,
            xpubSegwit: this.xpubSegwit,
            label: `Account #${this.id + 1}`,
            balance: this.info ? this.info.balance : '-1',
            transactions: this.getTransactionsCount(),
        };
        if (typeof account.xpubSegwit !== 'string') {
            delete account.xpubSegwit;
        }

        return account;
    }
}
