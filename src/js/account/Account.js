/* @flow */
'use strict';

import type {
    AccountInfo,
    Stream,
} from 'hd-wallet';

import BitcoreBackend from '../backend/BitcoreBackend';
import type { CoinInfo } from 'flowtype';

export default class Account {
    // Account variables
    id: number;
    basePath: Array<number>;
    xpub: string;
    backend: BitcoreBackend;
    coinInfo: CoinInfo;
    info: AccountInfo;

    constructor(
        id: number,
        path: Array<number>,
        xpub: string,
        backend: Object,
        coinInfo: CoinInfo
    ) {
        this.id = id;
        this.basePath = path;
        this.backend = backend;
        this.coinInfo = { ...coinInfo }; // local copy
        this.xpub = xpub;

        // if (version !== network.bip32.private &&
        //    version !== network.bip32.public) throw new Error('Invalid network version')
        // backend.coinInfo = this.coinInfo;

        // todo: handle backend errors/disconnect
    }

    setCoinInfo(coinInfo: CoinInfo): void {
        this.coinInfo = coinInfo;
    }

    setAccountMonitorListener(listener: (account: Account) => void): void {
        const monitor = this.backend.monitorAccountActivity(this.xpub, this.info, true);
        // TODO: handle monitor error
        monitor.values.attach(accountInfo => {
            if (accountInfo instanceof Error) {
                // TODO: pass error to listener?
            } else {
                this.info = accountInfo;
                listener(this);
            }
        });
    }

    monitorActivity(): Stream<AccountInfo | Error> {
        return this.backend.monitorAccountActivity(this.xpub, this.info, true);
    }

    async discover(): Promise<Account> {
        // TODO: catch error
        const info: AccountInfo = await this.backend.loadAccountInfo(
            this.xpub,
            null, // previous state
            (progress) => { },
            (disposer) => { },
            this.coinInfo.segwit
        );

        this.info = info;
        return this;

        // return this.backend.loadAccountInfo(
        //         this.xpub,
        //         null,
        //         () => { },
        //         (disposer) => { },
        //         this.coinInfo.segwit
        //     ).then(
        //         (info) => {
        //             this.info = info;
        //             return this;
        //         },
        //         (error) => {
        //             // TODO: throw eerrror
        //             console.error('[account] Account loading error', error);
        //         }
        //     );
    }

    getXpub() {
        return this.xpub;
    }

    getPath() {
        return this.basePath;
    }

    getAddressPath(address: string) {
        const addresses = this.info.usedAddresses.concat(this.info.unusedAddresses);
        const index = addresses.indexOf(address);
        // TODO: find in change addresses
        // if (index < 0)
        return this.basePath.concat([0, index]);
    }

    getNextAddress() {
        return this.info.unusedAddresses[0];
    }

    getNextAddressId() {
        return this.info.usedAddresses.length;
    }

    getChangeAddress() {
        return this.info.changeAddresses[this.info.changeIndex];
    }

    isUsed() {
        return (this.info && this.info.transactions.length > 0);
    }

    getBalance() {
        return this.info.balance;
    }

    getConfirmedBalance() {
        return this.info.balance; // TODO: read confirmations
    }

    getAccountInfo(): AccountInfo {
        return this.info;
    }

    getUtxos() {
        return this.info.utxos;
    }

    prevTxRequired(): boolean {
        if (this.coinInfo.segwit || this.backend.coinInfo.forkid !== null) {
            return false;
        }
        return true;
    }
}
