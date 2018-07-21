/* @flow */
'use strict';

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';

import { formatAmount } from '../../utils/formatUtils';

import { container, showView, postMessage } from './common';

import type { SimpleAccount } from 'flowtype';
import type { SelectAccount } from '../../types/ui-request';

export const selectAccount = (payload: $PropertyType<SelectAccount, 'payload'>): void => {
    if (!payload || !Array.isArray(payload.accounts)) return;

    // first render
    // configure buttons
    if (payload.start) {
        showView('select-account');

        if (payload.coinInfo.segwit) {
            const tabs: HTMLElement = container.getElementsByClassName('tabs')[0];
            tabs.style.display = 'flex';

            const selectAccountContainer: HTMLElement = container.getElementsByClassName('select-account')[0];
            const buttons: HTMLCollection<HTMLElement> = tabs.getElementsByClassName('tab-selection');
            let button: HTMLElement;
            for (button of buttons) {
                const type: ?string = button.getAttribute('data-tab');
                if (type) {
                    button.onclick = (event: MouseEvent) => {
                        selectAccountContainer.className = 'select-account ' + type;
                    };
                }
            }
        }
    }

    // set header
    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    h3.innerHTML = payload.complete ? `Select ${ payload.coinInfo.label } account` : `Loading ${ payload.coinInfo.label } accounts...`;

    const buttonsContainer: HTMLElement = container.querySelectorAll('.select-account-list.normal')[0];
    const legacyButtonsContainer: HTMLElement = container.querySelectorAll('.select-account-list.legacy')[0];

    const handleClick = (event: MouseEvent): void => {
        if (event.currentTarget instanceof HTMLElement) {
            postMessage(new UiMessage(UI.RECEIVE_ACCOUNT, event.currentTarget.getAttribute('data-index')));
        }
        buttonsContainer.style.pointerEvents = 'none';
    };

    const removeEmptyButton = (buttonContainer: HTMLElement): void => {
        const defaultButton: HTMLElement = buttonContainer.querySelectorAll('.account-default')[0];
        if (defaultButton) { buttonContainer.removeChild(defaultButton); }
    };

    const updateButtonValue = (button: HTMLButtonElement, account: SimpleAccount): void => {
        if (button.innerHTML.length < 1) {
            button.innerHTML = `
                <span class="account-title"></span>
                <span class="account-status"></span>`;
        }
        const title: HTMLElement = button.getElementsByClassName('account-title')[0];
        const status: HTMLElement = button.getElementsByClassName('account-status')[0];
        title.innerHTML = account.label;

        // TODO: Disable button once an account is fully loaded and its balance is 0

        if (account.balance < 0) {
            status.innerHTML = account.transactions ? `${ account.transactions } transactions` : 'Loading...';
            button.disabled = true;
        } else {
            status.innerHTML = account.transactions === 0 ? 'New account' : formatAmount(account.balance, payload.coinInfo);
            if (payload.checkBalance) {
                button.disabled = account.transactions === 0 || account.balance === 0;
            } else {
                button.disabled = false;
            }

            if (!button.disabled) {
                button.onclick = handleClick;
            }
        }
    };

    for (const [ index, account ] of payload.accounts.entries()) {
        const existed: HTMLButtonElement = (container.querySelectorAll(`[data-index="${index}"]`)[0]: any);
        if (!existed) {
            const button: HTMLButtonElement = document.createElement('button');
            button.className = 'list';
            button.setAttribute('data-index', index.toString());

            updateButtonValue(button, account);

            // add to proper container
            if (payload.coinInfo.segwit && !account.coinInfo.segwit) {
                removeEmptyButton(legacyButtonsContainer);
                legacyButtonsContainer.appendChild(button);
            } else {
                removeEmptyButton(buttonsContainer);
                buttonsContainer.appendChild(button);
            }
        } else {
            updateButtonValue(existed, account);
        }
    }
};

