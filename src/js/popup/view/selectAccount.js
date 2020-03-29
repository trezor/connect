/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';

import { container, showView, postMessage } from './common';

import type { DiscoveryAccount } from '../../types/account';
import type { SelectAccount } from '../../types/events';

const setHeader = (payload: $PropertyType<SelectAccount, 'payload'>) => {
    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    if (payload.type === 'end') {
        h3.innerHTML = `Select ${ payload.coinInfo.label } account`;
    } else {
        h3.innerHTML = `Loading ${ payload.coinInfo.label } accounts...`;
    }
};

export const selectAccount = (payload: $PropertyType<SelectAccount, 'payload'>): void => {
    if (!payload) return;

    const { accountTypes, defaultAccountType, accounts } = payload;

    // first render
    // show "select-account" view
    // configure tabs
    if (Array.isArray(accountTypes)) {
        showView('select-account');
        // setHeader(payload);

        if (accountTypes.length > 1) {
            const tabs: HTMLElement = container.getElementsByClassName('tabs')[0];
            tabs.style.display = 'flex';
            const selectAccountContainer: HTMLElement = container.getElementsByClassName('select-account')[0];
            const buttons: HTMLCollection<HTMLElement> = tabs.getElementsByClassName('tab-selection');
            let button: HTMLElement;
            const selectedType = defaultAccountType || (accountTypes.includes('segwit') ? 'segwit' : 'normal');
            selectAccountContainer.className = 'select-account ' + selectedType;
            if (accountTypes.includes('segwit')) {
                const bech32warn = container.getElementsByClassName('bech32-warning')[0];
                bech32warn.removeAttribute('style'); // remove default 'display: none' from element
            }
            for (button of buttons) {
                const type: ?string = button.getAttribute('data-tab');
                if (type && accountTypes.indexOf(type) >= 0) {
                    button.onclick = (event: MouseEvent) => {
                        selectAccountContainer.className = 'select-account ' + type;
                    };
                } else {
                    tabs.removeChild(button);
                }
            }
        }
        // return;
    }

    // set header
    setHeader(payload);
    if (!accounts) return;

    const buttons: {[key: string]: HTMLElement } = {
        'normal': container.querySelectorAll('.select-account-list.normal')[0],
        'segwit': container.querySelectorAll('.select-account-list.segwit')[0],
        'legacy': container.querySelectorAll('.select-account-list.legacy')[0],
    };

    const handleClick = (event: MouseEvent): void => {
        if (!(event.currentTarget instanceof HTMLElement)) return;
        const index = event.currentTarget.getAttribute('data-index');
        postMessage(UiMessage(UI.RECEIVE_ACCOUNT, parseInt(index)));
        showView('loader');
    };

    const removeEmptyButton = (buttonContainer: HTMLElement): void => {
        const defaultButton: HTMLElement = buttonContainer.querySelectorAll('.account-default')[0];
        if (defaultButton) { buttonContainer.removeChild(defaultButton); }
    };

    const updateButtonValue = (button: HTMLButtonElement, account: DiscoveryAccount): void => {
        if (button.innerHTML.length < 1) {
            button.innerHTML = `
                <span class="account-title"></span>
                <span class="account-status"></span>`;
        }
        const title: HTMLElement = button.getElementsByClassName('account-title')[0];
        const status: HTMLElement = button.getElementsByClassName('account-status')[0];
        title.innerHTML = account.label;

        // TODO: Disable button once an account is fully loaded and its balance is 0

        if (typeof account.balance !== 'string') {
            status.innerHTML = 'Loading...';
            button.disabled = true;
        } else {
            status.innerHTML = account.empty ? 'New account' : account.balance;
            button.disabled = false;
            if (payload.preventEmpty) {
                button.disabled = account.empty === true;
            } else {
                button.disabled = false;
            }

            if (!button.disabled) {
                button.onclick = handleClick;
            }
        }
    };

    for (const [ index, account ] of accounts.entries()) {
        const buttonContainer = buttons[account.type];
        const existed: HTMLButtonElement = (buttonContainer.querySelectorAll(`[data-index="${index}"]`)[0]: any);
        if (!existed) {
            const button: HTMLButtonElement = document.createElement('button');
            button.className = 'list';
            button.setAttribute('data-index', index.toString());

            updateButtonValue(button, account);
            removeEmptyButton(buttonContainer);
            buttonContainer.appendChild(button);
        } else {
            updateButtonValue(existed, account);
        }
    }
};

