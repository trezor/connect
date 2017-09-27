import { formatAmount } from '../utils/utils';

export const renderAccountDiscovery = (discovered, discovering) => {
    let accounts = (discovering)
            ? discovered.concat(discovering)
            : discovered;

    let index = 0;

    let components = accounts.map((account, i) => {
        let content;
        if (!account.isUsed()) {
            content = 'Fresh account';
        } else {
            content = formatAmount( account.getBalance() );
        }

        if (account !== discovering) {
            if (discovering) {
                return `
                    <div class="account">
                    <button disabled>
                    <span class="account-title">Account #${i + 1}</span>
                    <span class="account-status">${content}</span>
                    </button>
                    </div>`;
            } else {
                return `
                    <div class="account">
                    <button onclick="selectAccount(${i})">
                    <span class="account-title">Account #${i + 1}</span>
                    <span class="account-status">${content}</span>
                    </button>
                    </div>`;
            }
        } else {
            return `
                <div class="account">
                 <button disabled>
                 <span class="account-title">Account #${i + 1}</span>
                 <span class="account-status">Loading...</span>
                 </button>
                </div>`;
        }
    });

    console.log("RENDER", components, document.querySelector('#accounts'))

    document.querySelector('#accounts').innerHTML = components.join('');
}