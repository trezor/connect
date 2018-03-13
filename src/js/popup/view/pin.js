/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

const submit = (): void => {
    const button = container.getElementsByClassName('submit')[0];
    button.click();
};

const addPinFromKeyboard = (nr: number): void => {
    const input: HTMLInputElement = (container.getElementsByClassName('pin-input')[0]: any);
    if (input.value.length < 9) { input.value += nr; }
};

const backspacePin = (): void => {
    const input: HTMLInputElement = (container.getElementsByClassName('pin-input')[0]: any);
    const pin = input.value;
    input.value = pin.substring(0, pin.length - 1);
};

const pinKeyboardHandler = (event: KeyboardEvent): void => {
    event.preventDefault();
    switch (event.keyCode) {
        case 13 :
            // enter,
            submit();
            break;
        // backspace
        case 8 :
            backspacePin();
            break;

        // numeric and numpad
        case 49 :
        case 97 :
            addPinFromKeyboard(1);
            break;
        case 50 :
        case 98 :
            addPinFromKeyboard(2);
            break;
        case 51 :
        case 99 :
            addPinFromKeyboard(3);
            break;
        case 52 :
        case 100 :
            addPinFromKeyboard(4);
            break;
        case 53 :
        case 101 :
            addPinFromKeyboard(5);
            break;
        case 54 :
        case 102 :
            addPinFromKeyboard(6);
            break;
        case 55 :
        case 103 :
            addPinFromKeyboard(7);
            break;
        case 56 :
        case 104 :
            addPinFromKeyboard(8);
            break;
        case 57 :
        case 105 :
            addPinFromKeyboard(9);
            break;
    }
};

export const initPinView = (payload: any): void => {
    showView('pin');

    const header: HTMLElement = container.getElementsByTagName('h3')[0];
    const input: HTMLInputElement = (container.getElementsByClassName('pin-input')[0]: any);
    const enter: HTMLElement = container.getElementsByClassName('submit')[0];
    const backspace: HTMLElement = container.getElementsByClassName('pin-backspace')[0];
    const buttons: NodeList<HTMLElement> = container.querySelectorAll('[data-value]');

    header.innerHTML = header.innerHTML.replace('#TREZOR', payload.device.label);

    let i: number;
    const len: number = buttons.length;

    const handleClick = (event: MouseEvent) => {
        if (event.target instanceof HTMLElement) {
            const val: ?string = event.target.getAttribute('data-value');
            if (val) { input.value += val; }
        }
    };

    for (i = 0; i < len; i++) {
        buttons.item(i).addEventListener('click', handleClick);
    }

    backspace.addEventListener('click', backspacePin);

    enter.addEventListener('click', (event: MouseEvent) => {
        window.removeEventListener('keydown', pinKeyboardHandler, false);

        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PIN, input.value));
    });

    window.addEventListener('keydown', pinKeyboardHandler, false);
};
