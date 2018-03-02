/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';

import { formatAmount } from '../../utils/formatUtils';

import { container, showView, postMessage } from './common';

export const selectAccount = (data: ?Object): void => {
    if (!data || !Array.isArray(data.accounts)) return;

    // first render
    // configure buttons
    if (container.getElementsByClassName('accounts_normal').length < 1) {
        showView('select_account');

        if (data.coinInfo.segwit) {
            const tabs: HTMLElement = container.getElementsByClassName('account_type_tabs')[0];
            tabs.style.display = 'block';

            const selectAccountContainer: HTMLElement = container.getElementsByClassName('select_account')[0];
            const buttons: HTMLCollection<HTMLElement> = tabs.getElementsByClassName('account_type_tab');
            let button: HTMLElement;
            for (button of buttons) {
                const type: ?string = button.getAttribute('data-tab');
                if (type) {
                    button.onclick = (event: MouseEvent) => {
                        selectAccountContainer.className = 'select_account ' + type;
                    };
                }
            }
        }
    }

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    h3.innerHTML = data.complete ? `Select ${ data.coinInfo.label } account` : `Loading ${ data.coinInfo.label } accounts...`;

    const buttonsContainer: HTMLElement = container.getElementsByClassName('accounts_normal')[0];
    const legacyButtonsContainer: HTMLElement = container.getElementsByClassName('accounts_legacy')[0];

    const handleClick = (event: MouseEvent): void => {
        if (event.currentTarget instanceof HTMLElement) {
            postMessage(new UiMessage(UI.RECEIVE_ACCOUNT, event.currentTarget.getAttribute('data-index')));
        }
        buttonsContainer.style.pointerEvents = 'none';
    };

    const removeEmptyButton = (buttonContainer: HTMLElement): void => {
        const defaultButton: HTMLElement = buttonContainer.querySelectorAll('.account_default')[0];
        if (defaultButton) { buttonContainer.removeChild(defaultButton); }
    };

    const updateButtonValue = (button: HTMLElement, label: string, accountStatus: string): void => {
        if (button.innerHTML.length < 1) {
            button.innerHTML = `
                <span class="account_title"></span>
                <span class="account_status"></span>`;
        }
        const title: HTMLElement = button.getElementsByClassName('account_title')[0];
        const status: HTMLElement = button.getElementsByClassName('account_status')[0];
        title.innerHTML = label;
        status.innerHTML = accountStatus;
    };

    for (const [ index, account ] of data.accounts.entries()) {
        const existed: HTMLElement = container.querySelectorAll(`[data-index="${index}"]`)[0];
        if (!existed) {
            const button: HTMLButtonElement = document.createElement('button');
            button.setAttribute('data-index', index);
            if (!account.discovered) {
                button.setAttribute('disabled', 'disabled');
                updateButtonValue(button, account.label, 'Loading...');
            } else {
                const accountStatus: string = account.fresh ? 'Fresh account' : formatAmount(account.balance, data.coinInfo);
                updateButtonValue(button, account.label, accountStatus);
                button.onclick = handleClick;
            }

            // create new loading button
            const div: HTMLDivElement = document.createElement('div');
            div.className = 'account';
            div.appendChild(button);

            // add to proper container
            if (data.coinInfo.hasSegwit && !account.segwit) {
                removeEmptyButton(legacyButtonsContainer);
                legacyButtonsContainer.appendChild(div);
            } else {
                removeEmptyButton(buttonsContainer);
                buttonsContainer.appendChild(div);
            }
        } else {
            const accountStatus: string = account.fresh ? 'Fresh account' : formatAmount(account.balance, data.coinInfo); // + 'btc';
            existed.removeAttribute('disabled');
            updateButtonValue(existed, account.label, accountStatus);
            existed.onclick = handleClick;
        }
    }
};

