import { formatAmount } from '../utils/utils';

export const restoreSelectionAccounts = () => {
    document.querySelector('#accounts').innerHTML = `
        <div class="account">
            <button disabled>
                <span class="account-title">Account #1</span>
                <span class="account-status">Loading...</span>
            </button>
        </div>`;
    document.querySelector('#accounts-legacy').innerHTML = `
        <div class="account">
            <button disabled>
                <span class="account-title">Legacy Account #1</span>
                <span class="account-status">Loading...</span>
            </button>
        </div>`;
}

export const showSelectionAccounts = (discovered, discovering, coinInfo) => {

    let accounts = (discovering)
            ? discovered.concat(discovering)
            : discovered;

    let hasLegacyAccounts = (coinInfo.hasSegwit && coinInfo.forkid === null);

    let segwitButtons = [];
    let legacyButtons = [];
    accounts.map((account, i) => {
        let content;
        if (!account.isUsed()) {
            content = 'Fresh account';
        } else {
            content = formatAmount(account.getBalance(), coinInfo);
        }

        const label = account.segwit || !hasLegacyAccounts ? `Account #${i + 1}` : `Legacy Account #${i - segwitButtons.length + 1}`; // TODO label
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
        if (account.segwit || !hasLegacyAccounts) {
            segwitButtons.push(button);
        } else {
            legacyButtons.push(button);
        }
    });

    if (hasLegacyAccounts && legacyButtons.length < 1) {
        legacyButtons.push(`
            <div class="account">
                <button disabled>
                    <span class="account-title">Legacy Account #1</span>
                    <span class="account-status">Loading...</span>
                </button>
            </div>`);
    }

    document.querySelector('#accounts').innerHTML = segwitButtons.join('');
    document.querySelector('#accounts-legacy').innerHTML = legacyButtons.join('');
}

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