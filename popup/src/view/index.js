import { formatAmount } from '../utils/utils';
import { HD_HARDENED } from '../utils/constants';
var bip44 = require('bip44-constants');

// switch accounts tab
function switchAccountsTab(id) {
    const segwitTab = document.querySelector('#alert_accounts .accounts_segwit_tab');
    const legacyTab = document.querySelector('#alert_accounts .accounts_legacy_tab');
    const segwitDiv = document.querySelector('#accounts');
    const legacyDiv = document.querySelector('#accounts-legacy');
    if (id === 'legacy') {
        segwitTab.classList.remove('accounts_tab_active');
        legacyTab.classList.add('accounts_tab_active');
        segwitDiv.style.display = 'none';
        legacyDiv.style.display = 'block';
    } else {
        legacyTab.classList.remove('accounts_tab_active');
        segwitTab.classList.add('accounts_tab_active');
        legacyDiv.style.display = 'none';
        segwitDiv.style.display = 'block';
    }
}
global.switchAccountsTab = switchAccountsTab;

export const renderAccountDiscovery = (discovered, discovering) => {
    let accounts = (discovering)
            ? discovered.concat(discovering)
            : discovered;

    let segwitButtons = [];
    let legacyButtons = [];
    accounts.map((account, i) => {
        let content;
        if (!account.isUsed()) {
            content = 'Fresh account';
        } else {
            content = formatAmount( account.getBalance() );
        }

        const label = account.segwit ? `Account #${i + 1}` : `Legacy Account #${i - segwitButtons.length + 1}`;
        let button;
        if (account !== discovering) {
            button = `
                <div class="account">
                <button onclick="selectAccount(${i})">
                <span class="account-title">${label}</span>
                <span class="account-status">${content}</span>
                </button>
                </div>`;
        } else {
            button = `
                <div class="account">
                 <button disabled>
                 <span class="account-title">${label}</span>
                 <span class="account-status">Loading...</span>
                 </button>
                </div>`;
        }
        if (account.segwit) {
            segwitButtons.push(button);
        } else {
            legacyButtons.push(button);
            document.querySelector('#alert_accounts .accounts_tab').classList.add('visible');
        }
    });

    document.querySelector('#accounts').innerHTML = segwitButtons.join('');
    document.querySelector('#accounts-legacy').innerHTML = legacyButtons.join('');
}

export const showAlert = (selector) => {
    fadeOut('.alert');
    fadeIn(selector);
    global.alert = selector;
}

export const fadeIn = (selector) => {
    let els = document.querySelectorAll(selector);
    for (let i = 0; i < els.length; i++) {
        els[i].classList.remove('fadeout');
    }
    return els;
}

export const fadeOut = (selector) => {
    let els = document.querySelectorAll(selector);
    for (let i = 0; i < els.length; i++) {
        els[i].classList.add('fadeout');
    }
    return els;
}

export const xpubKeyLabel = (path) => {
    let hardened = (i) => path[i] & ~HD_HARDENED;
    if (hardened(0) === 44) {
        let coinName = getCoinName(path[1]);
        return `${coinName} Legacy account #${hardened(2) + 1}`;
    }
    if (hardened(0) === 48) {
        return `multisig account #${hardened(2) + 1}`;
    }
    if (hardened(0) === 49) {
        let coinName = getCoinName(path[1]);
        return `${coinName} account #${hardened(2) + 1}`;
    }
    if (path[0] === 45342) {
        if (hardened(1) === 44) {
            return `Copay ID of account #${hardened(2) + 1}`;
        }
        if (hardened(1) === 48) {
            return `Copay ID of multisig account #${hardened(2) + 1}`;
        }
    }
    return 'm/' + serializePath(path);
}

export const getCoinName = (n) => {
    for (let name of Object.keys(bip44)) {
        let number = parseInt(bip44[name]);
        if (number === n) {
            return name;
        }
    };
    return 'Unknown coin';
}


export const promptInfoPermission = (path) => {
    return new Promise((resolve, reject) => {
        let element = document.getElementById('accountinfo_id');
        element.innerHTML = xpubKeyLabel(path);
        element.callback = (exportInfo) => {
            showAlert(global.alert);
            if (exportInfo) {
                resolve();
            } else {
                reject(new Error('Cancelled'));
            }
        };
        showAlert('#alert_accountinfo');
    });
}

function exportInfo() {
    document.querySelector('#accountinfo_id').callback(true);
}

global.exportInfo = exportInfo;

function cancelInfo() {
    document.querySelector('#accountinfo_id').callback(false);
}

global.cancelInfo = cancelInfo;