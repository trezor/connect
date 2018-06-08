/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { DeviceMessage } from 'flowtype/ui-message';

export const initPassphraseView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('passphrase');

    const view: HTMLElement = container.getElementsByClassName('passphrase')[0];
    const header: HTMLElement = container.getElementsByTagName('h3')[0];
    const input1: HTMLInputElement = (container.getElementsByClassName('pass')[0]: any);
    const input2: HTMLInputElement = (container.getElementsByClassName('pass-check')[0]: any);
    const toggle: HTMLInputElement = (container.getElementsByClassName('show-passphrase')[0]: any);
    const enter: HTMLButtonElement = ( container.getElementsByClassName('submit')[0]: any);

    let inputType: string = 'password';

    header.innerHTML = header.innerHTML.replace('#TREZOR', payload.device.label);

    /* Functions */
    const handleInputCopyOrPaste = (e: Event) => {
        e.preventDefault();
    };
    const toggleInputFontStyle = (input: HTMLInputElement) => {
        if (inputType === 'text') {
            input.classList.add('text');
        } else if (inputType === 'password') {
            input.classList.remove('text');
        }
    }
    const validation = () => {
        if (input1.value !== input2.value) {
            enter.disabled = true;
            view.classList.add('not-valid');
        } else {
            enter.disabled = false;
            view.classList.remove('not-valid');
        }
    };
    const handleToggleClick = () => {
        inputType = inputType === 'text' ? 'password' : 'text';

        toggleInputFontStyle(input1);
        toggleInputFontStyle(input2);
    };
    const handleEnterClick = () => {
        input1.blur();
        input2.blur();

        window.removeEventListener('keydown', handleWindowKeydown);

        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PASSPHRASE, {
            save: true,
            value: input1.value,
        }));
    };
    const handleWindowKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            enter.click();
        }
    };
    /* Functions: END */

    input1.addEventListener('copy', handleInputCopyOrPaste);
    input2.addEventListener('copy', handleInputCopyOrPaste);

    input1.addEventListener('paste', handleInputCopyOrPaste);
    input2.addEventListener('paste', handleInputCopyOrPaste);

    input1.addEventListener('input', validation, false);
    input2.addEventListener('input', validation, false);

    toggle.addEventListener('click', handleToggleClick);
    enter.addEventListener('click', handleEnterClick);
    window.addEventListener('keydown', handleWindowKeydown, false);

    input1.focus();
};
