/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

export const initPassphraseView = (): void => {
    showView('passphrase');
    const input: HTMLInputElement = container.getElementsByTagName('input')[0];
    const show_passphrase: HTMLElement = container.getElementsByClassName('show_passphrase')[0];
    const save_passphrase: HTMLInputElement = (container.getElementsByClassName('save_passphrase')[0]: any);
    const enter: HTMLElement = container.getElementsByClassName('submit')[0];

    const DOT: string = '•';
    let password: boolean = true;
    let passValue: string = '';

    const onFocusIn = (): void => {
        input.setAttribute('type', 'password');
        input.value = passValue;
    };
    const onFocusOut = (): void => {
        passValue = input.value;
        input.setAttribute('type', 'text');
        input.value = passValue.replace(/./g, DOT);
    };

    input.addEventListener('focusin', onFocusIn, false);
    input.addEventListener('focusout', onFocusOut, false);

    const submit = (): void => {
        const button = container.getElementsByClassName('submit')[0];
        button.click();
    };

    const passKeyboardHandler = (event: KeyboardEvent): void => {
        if (event.keyCode === 13) {
            event.preventDefault();
            input.blur();
            submit();
        }
    };

    show_passphrase.addEventListener('click', () => {
        if (password) {
            password = false;
            input.setAttribute('type', 'text');
            input.value = passValue;
            input.removeEventListener('focusin', onFocusIn, false);
            input.removeEventListener('focusout', onFocusOut, false);
        } else {
            password = true;
            input.value = passValue.replace(/./g, DOT);
            input.addEventListener('focusin', onFocusIn, false);
            input.addEventListener('focusout', onFocusOut, false);
        }
        input.focus();
    });

    enter.addEventListener('click', () => {
        input.blur();
        window.removeEventListener('keydown', passKeyboardHandler);
        input.removeEventListener('focusin', onFocusIn, false);
        input.removeEventListener('focusout', onFocusOut, false);

        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PASSPHRASE, {
            save: save_passphrase.checked,
            value: passValue,
        }));
    });

    window.addEventListener('keydown', passKeyboardHandler, false);
    input.focus();
};
