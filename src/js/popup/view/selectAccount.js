/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';

import { container, showView, postMessage } from './common';

import type { DiscoveryAccount } from '../../types/account';
import type { SelectAccount } from '../../types/events';

const setHeader = (payload: $PropertyType<SelectAccount, 'payload'>) => {
    const h3 = container.getElementsByTagName('h3')[0];
    if (payload.type === 'end') {
        h3.innerHTML = `Select ${payload.coinInfo.label} account`;
    } else {
        h3.innerHTML = `Loading ${payload.coinInfo.label} accounts...`;
    }
};

export const selectAccount = (payload: $PropertyType<SelectAccount, 'payload'>) => {
    if (!payload) return;

    const { accountTypes, defaultAccountType, accounts } = payload;

    // first render
    // show "select-account" view
    // configure tabs
    if (Array.isArray(accountTypes)) {
        showView('select-account');
        // setHeader(payload);

        if (accountTypes.length > 1) {
            const tabs = container.getElementsByClassName('tabs')[0];
            tabs.style.display = 'flex';
            const selectAccountContainer = container.getElementsByClassName('select-account')[0];
            const buttons = tabs.getElementsByClassName('tab-selection');
            const selectedType =
                defaultAccountType || (accountTypes.includes('segwit') ? 'segwit' : 'normal');
            selectAccountContainer.className = `select-account ${selectedType}`;
            if (accountTypes.includes('segwit')) {
                const bech32warn = container.getElementsByClassName('bech32-warning')[0];
                bech32warn.removeAttribute('style'); // remove default 'display: none' from element
            }
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i];
                const type = button.getAttribute('data-tab');
                if (type && accountTypes.indexOf(type) >= 0) {
                    button.onclick = () => {
                        selectAccountContainer.className = `select-account ${type}`;
                    };
                } else {
                    tabs.removeChild(button);
                }
            }
        }
    }

    // set header
    setHeader(payload);
    if (!accounts) return;

    const buttons = {
        normal: container.querySelectorAll('.select-account-list.normal')[0],
        segwit: container.querySelectorAll('.select-account-list.segwit')[0],
        legacy: container.querySelectorAll('.select-account-list.legacy')[0],
    };

    const handleClick = (event: MouseEvent) => {
        if (!(event.currentTarget instanceof HTMLElement)) return;
        const index = event.currentTarget.getAttribute('data-index');
        postMessage(UiMessage(UI.RECEIVE_ACCOUNT, parseInt(index, 10)));
        showView('loader');
    };

    const removeEmptyButton = (buttonContainer: HTMLElement) => {
        const defaultButton = buttonContainer.querySelectorAll('.account-default')[0];
        if (defaultButton) {
            buttonContainer.removeChild(defaultButton);
        }
    };

    const updateButtonValue = (button: Element, account: DiscoveryAccount) => {
        if (button.innerHTML.length < 1) {
            button.innerHTML = `
                <span class="account-title"></span>
                <span class="account-status"></span>`;
        }
        const title = button.getElementsByClassName('account-title')[0];
        const status = button.getElementsByClassName('account-status')[0];
        title.innerHTML = account.label;

        if (typeof account.balance !== 'string') {
            status.innerHTML = 'Loading...';
            button.setAttribute('disabled', 'disabled');
        } else {
            status.innerHTML = account.empty ? 'New account' : account.balance;
            const buttonDisabled = payload.preventEmpty && account.empty;
            if (buttonDisabled) {
                button.setAttribute('disabled', 'disabled');
            } else {
                button.removeAttribute('disabled');
                button.addEventListener('click', handleClick, false);
            }
        }
    };

    accounts.forEach((account, index) => {
        const buttonContainer = buttons[account.type];
        const existed = buttonContainer.querySelectorAll(`[data-index="${index}"]`)[0];
        if (!existed) {
            const button = document.createElement('button');
            button.className = 'list';
            button.setAttribute('data-index', index.toString());

            updateButtonValue(button, account);
            removeEmptyButton(buttonContainer);
            buttonContainer.appendChild(button);
        } else {
            updateButtonValue(existed, account);
        }
    });
};
