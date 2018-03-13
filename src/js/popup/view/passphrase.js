/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const initPassphraseView = (payload: any): void => {
    showView('passphrase');
    const view: HTMLElement = container.getElementsByClassName('passphrase')[0];
    const header: HTMLElement = container.getElementsByTagName('h3')[0];
    const input1: HTMLInputElement = container.getElementsByTagName('input')[0];
    const input2: HTMLInputElement = container.getElementsByTagName('input')[1];
    const toggle: HTMLElement = container.getElementsByClassName('show-passphrase')[0];
    const enter: HTMLButtonElement = ( container.getElementsByClassName('submit')[0]: any);

    const DOT: string = '•';
    let inputType: string = 'password';
    let passphrase: string = '';
    let passphraseRevision: string = '';

    header.innerHTML = header.innerHTML.replace('#TREZOR', payload.device.label);

    const validation = () => {
        if (input1.value !== input2.value) {
            enter.disabled = true;
            view.classList.add('not-valid');
        } else {
            enter.disabled = false;
            view.classList.remove('not-valid');
        }
    }

    input1.addEventListener('input', validation, false);
    input2.addEventListener('input', validation, false);

    const submit = (): void => {
        const button = container.getElementsByClassName('submit')[0];
        button.click();
    };

    const passKeyboardHandler = (event: KeyboardEvent): void => {
        if (event.keyCode === 13) {
            event.preventDefault();
            input1.blur();
            input2.blur();
            submit();
        }
    };

    toggle.addEventListener('click', () => {
        inputType = inputType === 'text' ? 'password' : 'text';
        input1.setAttribute('type', inputType);
        input2.setAttribute('type', inputType);
    });

    enter.addEventListener('click', () => {
        input1.blur();
        window.removeEventListener('keydown', passKeyboardHandler);
        input1.removeEventListener('input', validation, false);
        input2.removeEventListener('input', validation, false);

        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PASSPHRASE, {
            save: true,
            value: input1.value,
        }));
    });

    window.addEventListener('keydown', passKeyboardHandler, false);
    input1.focus();
};
