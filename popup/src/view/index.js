import { formatAmount } from '../utils/utils';

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