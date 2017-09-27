/* @flow */

import { renderAccountDiscovery, showAlert } from '../view';
import { HD_HARDENED } from '../utils/constants';

export const getPathForIndex = (bip44purpose: number, bip44cointype: number, index: number): Array<number> => {
    return [
        (bip44purpose | HD_HARDENED) >>> 0,
        (bip44cointype | HD_HARDENED) >>> 0,
        (index | HD_HARDENED) >>> 0
    ];
}

export const discoverAllAccounts = (device, bitcoreBackend, limit) => {
    let accounts = [];
    const discover = (i) => {
        return Account.fromIndex(device, bitcoreBackend, i)
        .then((account) => {
            return account.discover().then(discovered => {
                accounts.push(discovered);
                if (discovered.info.transactions.length > 0) {
                    
                    if (i + 1 >= limit) {
                        return accounts; // stop at limit
                    }
                    return discover(i + 1);
                } else {
                    return accounts;
                }
            });
        });
    }
    return discover(0, limit);
}

export const discover = (device, backend, limit) => {

    showAlert('#alert_accounts');
    const container = document.querySelector('#alert_accounts');
    const heading = document.querySelector('#alert_accounts .alert_heading');
    heading.textContent = 'Loading accounts...';

    let accounts = [];
    const inside = (i) => {
        return Account.fromIndex(device, backend, i)
        .then(account => {
            renderAccountDiscovery(accounts, account, backend.coinInfo.segwit);
            return account.discover().then(discovered => {
                accounts.push(discovered);
                renderAccountDiscovery(accounts, null, backend.coinInfo.segwit);
                if (discovered.info.transactions.length > 0) {
                    return inside(i + 1);
                } else {
                    if (backend.coinInfo.segwit) {
                        backend.coinInfo.segwit = false;
                        //accounts = [];
                        return inside(0);
                    } else {
                        global.alert = '#alert_loading';
                        heading.textContent = 'Select an account:';
                        container.classList.remove('loading');
                        return accounts;
                    }
                }
            });
        });
    }
    return inside(0);
}


export default class Account {

    static fromPath(device, backend, path): Account {
        const purpose = path[0] & ~HD_HARDENED;
        const id = path[2] & ~HD_HARDENED;
        const coinInfo = backend.coinInfo;
        coinInfo.segwit = (purpose === 49);
        return device.session.getHDNode(path, coinInfo.network).then(
            node => new Account(id, path, node.toBase58(), backend)
        );
    }

    static fromIndex(device, backend, id): Account {
        const coinInfo = backend.coinInfo;
        const path: Array<number> = getPathForIndex(coinInfo.segwit ? 49 : 44, coinInfo.bip44, id);
        return device.session.getHDNode(path, coinInfo.network).then(
            node => new Account(id, path, node.toBase58(), backend)
        );
    }

    id: number;
    basePath: Array<number>;
    xpub: string;
    backend: Object;
    info: Object;

    constructor(
        id: number,
        path: Array<number>,
        xpub: string,
        backend
    ) {
        this.id = id;
        this.basePath = path;
        this.xpub = xpub;
        this.backend = backend;
        this.segwit = backend.coinInfo.segwit;
    }

    discover() {
        
        return this.backend.loadAccountInfo(
                this.xpub,
                null,
                () => { },
                (disposer) => { },
                this.segwit
            ).then(
                (info) => {
                    this.info = info;
                    return this;
                },
                (error) => {
                    // TODO: throw eerrror
                    console.error('[account] Account loading error', error);
                }
            );
    }

    getXpub() {
        return this.xpub;
    }

    getPath() {
        return this.basePath;
    }

    getAddressPath(address) {
        let addresses = this.info.usedAddresses.concat(this.info.unusedAddresses);
        let index = addresses.indexOf(address);
        // TODO: find in change addresses
        //if (index < 0)
        return this.basePath.concat([0, index]);
    }

    getNextAddress() {
        return this.info.unusedAddresses[0];
    }

    getNextAddressId() {
        return this.info.usedAddresses.length;
    }

    isUsed() {
        console.log("isUsed", this.info);
        return (this.info && this.info.transactions.length > 0);
    }

    getBalance() {
        console.log("getBalance", this.info);
        return this.info.balance;
    }

    getConfirmedBalance() {
        return this.info.balance; // TODO: read confirmations
    }
}