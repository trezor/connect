/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';

import { container, showView, postMessage } from './common';
import { formatAmount, formatTime } from '../../utils/formatUtils';
import type { SelectFee, UpdateCustomFee } from '../../types/events';
import type { BitcoinNetworkInfo } from '../../types';
import type { SelectFeeLevel } from '../../types/account';

const fees: Array<SelectFeeLevel> = [];
// reference to currently selected button
let selectedFee: ?HTMLElement;

/*
 * Update custom fee view.
 */
export const updateCustomFee = (payload: $PropertyType<UpdateCustomFee, 'payload'>) => {
    const custom: HTMLElement = container.getElementsByClassName('custom-fee')[0];
    const opener: HTMLElement = container.getElementsByClassName('opener')[0];
    const customFeeLabel = opener.getElementsByClassName('fee-info')[0];

    if (custom.className.indexOf('active') < 0) {
        return;
    }

    // replace values
    fees.splice(0, fees.length);
    // add new fees from message
    fees.push(...payload.feeLevels);

    const customFee = fees.find(f => f.name === 'custom');
    if (customFee) {
        if (customFee.fee === '0') {
            customFeeLabel.innerHTML = 'Insufficient funds';
        } else {
            customFeeLabel.innerHTML = `
                <span class="fee-amount">${formatAmount(customFee.fee, payload.coinInfo)}</span>
                <span class="fee-time">${formatTime(customFee.minutes)}</span>
            `;
        }
    }

    // eslint-disable-next-line no-use-before-define
    validation(payload.coinInfo);
};

const validation = (coinInfo: BitcoinNetworkInfo) => {
    const sendButton: HTMLElement = container.getElementsByClassName('send-button')[0];
    if (!selectedFee) {
        sendButton.setAttribute('disabled', 'disabled');
        sendButton.innerHTML = 'Send';
        return;
    }
    const selectedName: string = selectedFee.getAttribute('data-fee') || 'custom';
    const selectedValue = fees.find(f => f.name === selectedName);

    if (selectedValue && selectedValue.fee !== '0') {
        sendButton.removeAttribute('disabled');
        sendButton.innerHTML = `Send ${ formatAmount(selectedValue.total, coinInfo) }`;
    } else {
        sendButton.setAttribute('disabled', 'disabled');
        sendButton.innerHTML = 'Send';
    }
};

/*
 * Show select fee view.
 */
export const selectFee = (data: $PropertyType<SelectFee, 'payload'>): void => {
    if (!data || !Array.isArray(data.feeLevels)) return; // TODO: back to accounts?

    showView('select-fee');

    // remove old references
    selectedFee = null;
    fees.splice(0, fees.length);
    // add new fees from message
    fees.push(...data.feeLevels);

    // build innerHTML string with fee buttons
    const feesComponents: Array<string> = [];
    fees.forEach((level, index) => {
        // ignore custom
        if (level.name === 'custom') return;

        let feeName: string = level.name;
        if (level.name === 'normal' && level.fee !== '0') {
            feeName = `<span>${level.name}</span>
                <span class="fee-subtitle">recommended</span>`;
        }

        if (level.fee !== '0') {
            feesComponents.push(`
                <button data-fee="${level.name}" class="list">
                    <span class="fee-title">${feeName}</span>
                    <span class="fee-info">
                        <span class="fee-amount">${formatAmount(level.fee, data.coinInfo)}</span>
                        <span class="fee-time">${formatTime(level.minutes)}</span>
                    </span>
                </button>
            `);
        } else {
            feesComponents.push(`
                <button disabled class="list">
                    <span class="fee-title">${feeName}</span>
                    <span class="fee-info">Insufficient funds</span>
                </button>
            `);
        }
    });

    const feeList: HTMLElement = container.getElementsByClassName('select-fee-list')[0];
    // append custom fee button
    feesComponents.push(feeList.innerHTML);
    // render all buttons
    feeList.innerHTML = feesComponents.join('');

    // references to html elements
    const sendButton: HTMLElement = container.getElementsByClassName('send-button')[0];
    const opener: HTMLElement = container.getElementsByClassName('opener')[0];
    const customFeeLabel = opener.getElementsByClassName('fee-info')[0];

    const onFeeSelect = (event: MouseEvent): void => {
        if (event.currentTarget instanceof HTMLElement) {
            if (selectedFee) {
                selectedFee.classList.remove('active');
            }
            selectedFee = event.currentTarget;
            selectedFee.classList.add('active');

            validation(data.coinInfo);
        }
    };

    // find all buttons which has composed transaction and add click event listener to it
    const feeButtons: NodeList<HTMLElement> = feeList.querySelectorAll('[data-fee]');
    for (let i = 0; i < feeButtons.length; i++) {
        feeButtons.item(i).addEventListener('click', onFeeSelect);
    }

    // custom fee button logic
    let composingTimeout: number = 0;
    opener.onclick = () => {
        if (opener.className.indexOf('active') >= 0) return;

        if (selectedFee) {
            selectedFee.classList.remove('active');
        }

        const composedCustomFee = fees.find(f => f.name === 'custom');
        let customFeeDefaultValue: string = '0';
        if (!composedCustomFee) {
            if (selectedFee) {
                const selectedName: ?string = selectedFee.getAttribute('data-fee');
                const selectedValue = fees.find(f => f.name === selectedName);
                if (selectedValue && selectedValue.fee !== '0') {
                    customFeeDefaultValue = selectedValue.feePerByte;
                }
            }

            if (!customFeeDefaultValue === '0') {
                customFeeDefaultValue = '1'; // TODO: get normal
            }
        } else if (composedCustomFee.fee !== '0') {
            customFeeDefaultValue = composedCustomFee.feePerByte;
        }

        opener.classList.add('active');
        selectedFee = opener;
        // eslint-disable-next-line no-use-before-define
        focusInput(customFeeDefaultValue);
    };

    const focusInput = (defaultValue: string) => {
        const input: HTMLInputElement = container.getElementsByTagName('input')[0];
        setTimeout(() => {
            // eslint-disable-next-line no-use-before-define
            input.oninput = handleCustomFeeChange;
            if (defaultValue) {
                input.value = defaultValue.toString();
                const event = document.createEvent('Event');
                event.initEvent('input', true, true);
                input.dispatchEvent(event);
            }
            input.focus();
        }, 1);
    };

    const minFee: number = data.coinInfo.minFeeSatoshiKb / 1000;
    const maxFee: number = data.coinInfo.maxFeeSatoshiKb / 1000;

    const handleCustomFeeChange = (event: Event): void => {
        window.clearTimeout(composingTimeout);

        sendButton.setAttribute('disabled', 'disabled');
        // $FlowIssue value not found on Event target
        const value = event.currentTarget.value;
        const valueNum = parseInt(value);

        if (isNaN(valueNum)) {
            if (value.length > 0) {
                customFeeLabel.innerHTML = 'Incorrect fee';
            } else {
                customFeeLabel.innerHTML = 'Missing fee';
            }
        } else if (valueNum.toString() !== value) {
            customFeeLabel.innerHTML = 'Incorrect fee';
        } else if (valueNum < minFee) {
            customFeeLabel.innerHTML = 'Fee is too low';
        } else if (valueNum > maxFee) {
            customFeeLabel.innerHTML = 'Fee is too big';
        } else {
            customFeeLabel.innerHTML = 'Composing...';

            const composeCustomFeeTimeoutHandler = () => {
                postMessage(UiMessage(UI.RECEIVE_FEE, {
                    type: 'compose-custom',
                    value,
                }));
            };

            composingTimeout = window.setTimeout(composeCustomFeeTimeoutHandler, 800);
        }
    };

    const changeAccountButton: HTMLElement = container.getElementsByClassName('back-button')[0];
    changeAccountButton.onclick = () => {
        postMessage(UiMessage(UI.RECEIVE_FEE, {
            type: 'change-account',
        }));
        showView('loader');
    };

    sendButton.onclick = () => {
        if (!selectedFee) return;
        const selectedName: ?string = selectedFee.getAttribute('data-fee');
        postMessage(UiMessage(UI.RECEIVE_FEE, {
            type: 'send',
            value: selectedName || 'custom',
        }));
        showView('loader');
    };

    // select default fee level
    const defaultLevel = feeList.querySelectorAll('[data-fee="normal"]')[0];
    if (defaultLevel) {
        defaultLevel.click();
    } else {
        // normal level not available, try to select first active button or custom fee
        const allLevels = feeList.querySelectorAll('.list');
        for (let i = 0; i < allLevels.length; i++) {
            if (!allLevels[i].hasAttribute('disabled')) {
                allLevels[i].click();
                break;
            }
        }
    }
};

