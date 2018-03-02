/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';

import { container, showView, postMessage } from './common';
import { formatAmount, formatTime } from '../../utils/formatUtils';

const onFeeSelect = (event: MouseEvent): void => {
    if (event.currentTarget instanceof HTMLElement) {
        const val: ?string = event.currentTarget.getAttribute('data-fee');
        if (val) {
            postMessage(new UiMessage(UI.RECEIVE_FEE, { value: val, type: 'fee' }));
            showView('loader');
        }
    }
};

/*
 * Show select fee view.
 */
export const selectFee = (data: ?Object): void => {
    if (!data || !Array.isArray(data.list)) return;

    showView('select_fee');

    const feesComponents: Array<string> = [];
    for (const [ feeIndex, feeItem ] of data.list.entries()) {
        // skip custom
        if (feeItem.name === 'custom') continue;

        let feeName: string = '';
        if (feeItem.name === 'normal' && feeItem.bytes > 0) {
            feeName = `
                <span class="fee-name-normal">${feeItem.name}</span>
                <span class="fee-name-subtitle">recommended</span>
                `;
        } else {
            feeName = `<span class="fee-name">${feeItem.name}</span>`;
        }

        if (feeItem.fee > 0) {
            feesComponents.push(`
                <div class="fee">
                    <button data-fee="${feeIndex}">
                        ${feeName}
                        <span class="fee-size">${formatAmount(feeItem.fee, data.coinInfo)}</span>
                        <span class="fee-minutes">${formatTime(feeItem.minutes)}</span>
                    </button>
                </div>
            `);
        } else {
            feesComponents.push(`
                <div class="fee insufficient-funds">
                    <button disabled>
                        ${feeName}
                        <span class="fee-insufficient-funds">Insufficient funds</span>
                    </button>
                </div>
            `);
        }
    }

    const changeAccountButton: HTMLElement = container.getElementsByClassName('change_account')[0];
    const feeList: HTMLElement = container.getElementsByClassName('select_fee_list')[0];

    feesComponents.push(feeList.innerHTML);
    feeList.innerHTML = feesComponents.join('');

    // find all fee buttons
    const feeButtons: NodeList<HTMLElement> = feeList.querySelectorAll('[data-fee]');
    for (let i = 0; i < feeButtons.length; i++) {
        feeButtons.item(i).addEventListener('click', onFeeSelect);
    }

    const opener: HTMLElement = container.getElementsByClassName('fee-custom-opener')[0];
    const custom: HTMLElement = container.getElementsByClassName('fee-custom')[0];
    const input: HTMLInputElement = custom.getElementsByTagName('input')[0];
    const label = opener.getElementsByClassName('fee-insufficient-funds')[0];
    const labelSize = opener.getElementsByClassName('fee-size')[0];
    const labelTime = opener.getElementsByClassName('fee-minutes')[0];
    const customSendButton: HTMLElement = custom.getElementsByClassName('fee-custom-button')[0];
    customSendButton.setAttribute('data-fee', (data.list.length - 1).toString());

    const minFee: number = data.coinInfo.minFeeSatoshiKb / 1000;
    const maxFee: number = data.coinInfo.maxFeeSatoshiKb / 1000;

    let composingTimeout: number = 0;
    let firstComposing: boolean = true;

    opener.onclick = () => {
        opener.classList.remove('untouched');
        if (opener.className.indexOf('opened') >= 0) {
            opener.classList.remove('opened');
            custom.classList.add('hidden');
        } else {
            opener.classList.add('opened');
            custom.classList.remove('hidden');
            setTimeout(function () {
                input.focus();
                if (input.setSelectionRange) {
                    input.setSelectionRange(input.value.length, input.value.length);
                }
                // window.scrollTo(0, 0);
                if (firstComposing) {
                    firstComposing = false;
                    const event = document.createEvent('Event');
                    event.initEvent('input', true, true);
                    input.dispatchEvent(event);
                }
            }, 1);
        }
    };

    changeAccountButton.onclick = () => {
        postMessage(new UiMessage(UI.CHANGE_ACCOUNT));
        showView('loader');
    };

    const handleCustomFeeChange = (event): void => {
        const value: number = parseInt(input.value);
        customSendButton.onclick = null;
        customSendButton.setAttribute('disabled', 'disabled');
        label.innerHTML = labelSize.innerHTML = labelTime.innerHTML = '';
        window.clearTimeout(composingTimeout);

        if (isNaN(value)) {
            if (input.value.length > 0) {
                label.innerHTML = 'Incorrect fee';
            } else {
                label.innerHTML = 'Missing fee';
            }
        } else {
            if (value >= maxFee) {
                label.innerHTML = 'Fee is too big';
            } else if (value >= minFee) {
                label.innerHTML = 'Composing...';
                composingTimeout = window.setTimeout(function () {
                    postMessage(new UiMessage(UI.RECEIVE_FEE, { value: value, type: 'custom' }));
                }, 800);
            } else {
                label.innerHTML = 'Fee is too low';
            }
        }
    };

    input.oninput = handleCustomFeeChange;
    if (typeof input.onpropertychange === 'function') {
        // $FlowIssue: onpropertychange not found in HTMLInputElement
        input.onpropertychange = input.oninput; // for IE8
    }
};

/*
 * Update custom fee view.
 */
export const updateCustomFee = (data: Object) => {
    const opener: HTMLElement = container.getElementsByClassName('fee-custom-opener')[0];
    const custom: HTMLElement = container.getElementsByClassName('fee-custom')[0];
    const label = opener.getElementsByClassName('fee-insufficient-funds')[0];
    const labelSize = opener.getElementsByClassName('fee-size')[0];
    const labelTime = opener.getElementsByClassName('fee-minutes')[0];
    const customSendButton: HTMLElement = custom.getElementsByClassName('fee-custom-button')[0];

    label.innerHTML = '';
    if (data.fee > 0) {
        customSendButton.removeAttribute('disabled');
        labelSize.innerHTML = formatAmount(data.fee, data.coinInfo);
        labelTime.innerHTML = formatTime(data.minutes);

        customSendButton.onclick = onFeeSelect;
    } else {
        label.innerHTML = 'Insufficient funds';
    }
};
