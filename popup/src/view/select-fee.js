import { formatAmount, formatTime } from '../utils/utils';
import { showAlert } from './common';

export const CHANGE_ACCOUNT = new Error('Change account');

export const showSelectionFees = (transactions, defaultCustomFee, coinInfo, composeFn) => {

    const heading = document.querySelector('#alert_fees .alert_heading');
    const container = document.querySelector('#fees');

    const minFee: number = coinInfo.minFeeSatoshiKb / 1000;
    const maxFee: number = coinInfo.maxFeeSatoshiKb / 1000;

    showAlert('#alert_fees');
    global.alert = '#alert_fees';

    heading.textContent = 'Select fee:';

    let atLeastOnePredefinedFee: boolean = false;

    let components = transactions.map((transactionFeeInfo, i) => {
        let feeNameObj = '';
        if (transactionFeeInfo.name === 'normal' && transactionFeeInfo.tx) {
            feeNameObj = `
                <span class="fee-name-normal">${transactionFeeInfo.name}</span>
                <span class="fee-name-subtitle">recommended</span>
                `;
        } else {
            feeNameObj = `<span class="fee-name">${transactionFeeInfo.name}</span>`;
        }
        if (transactionFeeInfo.tx) {
            atLeastOnePredefinedFee = true;
            return `
                <div class="fee">
                    <button onclick="selectFee(${i})">
                        ${feeNameObj}
                        <span class="fee-size">${formatAmount(transactionFeeInfo.tx.fee, coinInfo)}</span>
                        <span class="fee-minutes">${formatTime(transactionFeeInfo.minutes)}</span>
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="fee insufficient-funds">
                <button disabled>
                    ${feeNameObj}
                    <span class="fee-insufficient-funds">Insufficient funds</span>
                </button>
                </div>
            `;
        }
    });
    

    // custom fee
    components.push(`
        <div class="fee">
            <button class="fee-custom-opener untouched" onclick="selectCustomFee()">
                <span class="fee-name">custom</span>
                <span class="fee-insufficient-funds"></span>
                <span class="fee-size"></span>
                <span class="fee-minutes"></span>
            </button>
            <div class="fee-custom hidden">
                <div class="fee-custom-wrapper">
                    <input type="text" name="custom_fee" value="${defaultCustomFee}" data-lpignore="true" />
                    <div class="fee-custom-label">sat/B</div>
                    <button class="fee-custom-button" disabled="disabled">SEND</button>
                </div>
                <div class="fee-custom-warning">
                    <strong>Setting custom fee is not recommended.</strong>
                    If you set too low fee, it might get stuck forever.
                </div>
            </div>
        </div>
    `);

    container.innerHTML = components.join('');

    const custom = container.querySelector('.fee-custom');
    const input = container.querySelector('.fee-custom-wrapper input');
    const customOpenButton = container.querySelector('.fee .fee-custom-opener');
    const customSendButton = container.querySelector('.fee-custom-wrapper .fee-custom-button');
    const label = customOpenButton.querySelector('.fee-insufficient-funds');
    const labelSize = customOpenButton.querySelector('.fee-size');
    const labelTime = customOpenButton.querySelector('.fee-minutes');

    let composingTimeout: number = 0;

    const handleCustomFeeChange = (event): void => {
        const value = event.target.value;

        customSendButton.setAttribute('disabled', 'disabled');
        label.innerHTML = labelSize.innerHTML = labelTime.innerHTML = '';
        window.clearTimeout(composingTimeout);

        if (!(/^\d+(\.\d*)?$/.test(value))) {
            if (value.length > 0) {
                label.innerHTML = 'Incorrect fee';
            } else {
                label.innerHTML = 'Missing fee';
            }
        } else {
            if (value >= maxFee) {
                label.innerHTML = 'Fee is too big';
            } else if (value >= minFee) {
                label.innerHTML = 'Composing...';
                composingTimeout = window.setTimeout(function(){
                    composeFn(value).then(tx => {
                        if (tx) {
                            customSendButton.removeAttribute('disabled');
                            label.innerHTML = '';
                            labelSize.innerHTML = formatAmount(tx.fee, coinInfo);
                            labelTime.innerHTML = formatTime(0);
                            customSendButton.onclick = () => {
                                window.selectFee(tx);
                            }
                        } else {
                            label.innerHTML = 'Insufficient funds';
                        }
                    });
                }, 500);
            } else {
                label.innerHTML = 'Fee is too low';
            }
        }
    }

    let firstComposing: boolean = true;

    const selectCustomFee = () => {
        customOpenButton.classList.remove('untouched');
        if (customOpenButton.className.indexOf('opened') >= 0) {
            customOpenButton.classList.remove('opened');
            custom.classList.add('hidden');
        } else {
            customOpenButton.classList.add('opened');
            custom.classList.remove('hidden');
            setTimeout(function(){
                input.focus();
                if (input.setSelectionRange) {
                    input.setSelectionRange(input.value.length, input.value.length);
                }
                //window.scrollTo(0, document.body.scrollHeight);
                window.scrollTo(0, 0);

                if (firstComposing) {
                    firstComposing = false;
                    var event = document.createEvent('Event');
                    event.initEvent('input', true, true);
                    input.dispatchEvent(event);
                }
            }, 1);
        }
    }

    const selectFee = (transactions) => {
        return new Promise((resolve, reject) => {
            window.selectFee = (selectedFee) => {

                showAlert('#alert_loading');

                if (selectedFee === 'change_account') {
                    reject(CHANGE_ACCOUNT);
                }
                window.selectFee = null;
                window.selectCustomFee = null;
                document.querySelector('#fees').innerHTML = '';
                document.querySelector('#alert_fees .alert_heading').innerHTML = '';
                if (typeof selectedFee === 'number') {
                    const composed = transactions[selectedFee].tx;
                    resolve({ ...composed.tx, account: composed.account });
                } else {
                    // custom fee
                    resolve( { ...selectedFee.tx, account: selectedFee.account } );
                }
            };
        });
    }

    window.selectCustomFee = selectCustomFee;

    input.oninput = handleCustomFeeChange;
    input.onpropertychange = input.oninput; // for IE8

    if (!atLeastOnePredefinedFee) {
        selectCustomFee();
    }

    return selectFee(transactions);
}