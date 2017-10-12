
import { showSelectionAccounts, restoreSelectionAccounts, showAlert } from '../view';
import Account from './Account';

// interruption for account discovery
let isDiscovering: boolean = false;
export const stopAccountsDiscovery = () => {
    isDiscovering = false;
}

export const discoverAccounts = (device, backend, onUpdate, limit) => {

    showAlert('#alert_accounts');
    const container = document.querySelector('#alert_accounts');
    const heading = document.querySelector('#alert_accounts .alert_heading');
    const coinName = backend.coinInfo.label;
    heading.innerHTML = `Loading <strong>${coinName}</strong> accounts...`;

    const hasSegwit = (backend.coinInfo.hasSegwit && backend.coinInfo.forkid === null);
    if (!hasSegwit) {
        container.classList.add('no-segwit');
    } else {
        container.classList.remove('no-segwit');
    }
    restoreSelectionAccounts();

    let accounts = [];
    const inside = (i) => {
        if (!isDiscovering) return accounts;
        return Account.fromIndex(device, backend, i)
        .then(account => {
            showSelectionAccounts(accounts, account, backend.coinInfo);
            return account.discover().then(discovered => {
                accounts.push(discovered);
                onUpdate(discovered);

                showSelectionAccounts(accounts, null, backend.coinInfo);
                if (discovered.info.transactions.length > 0) {
                    return inside(i + 1);
                } else {
                    if (backend.coinInfo.segwit) {
                        backend.coinInfo.segwit = false;
                        return inside(0);
                    } else {
                        global.alert = '#alert_loading';
                        heading.innerHTML = `Select an <strong>${coinName}</strong> account:`;
                        container.classList.remove('loading');
                        
                        return accounts;
                    }
                }
            });
        });
    }

    // reset backend segwit settings
    isDiscovering = true;
    backend.coinInfo.segwit = backend.coinInfo.hasSegwit;
    return inside(0);
}

// All at once
export const discoverAllAccounts = (device, backend, limit) => {
    let accounts = [];
    const discover = (i) => {
        return Account.fromIndex(device, backend, i)
        .then((account) => {
            return account.discover().then(discovered => {
                accounts.push(discovered);
                if (discovered.info.transactions.length > 0) {
                    return discover(i + 1, limit);
                } else {
                    if (backend.coinInfo.segwit) {
                        backend.coinInfo.segwit = false;
                        return discover(0, limit);
                    } else {
                        return accounts;
                    }
                }
            });
        });
    }
    return discover(0, limit);
}