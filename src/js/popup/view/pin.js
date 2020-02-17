/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { DeviceMessage } from '../../types/events';

const isSubmitButtonDisabled = (isDisabled: boolean) => {
    const submitButton: HTMLElement = container.getElementsByClassName('submit')[0];
    if (isDisabled) {
        submitButton.setAttribute('disabled', 'true');
    } else {
        submitButton.removeAttribute('disabled');
    }
};

const submit = (): void => {
    const button = container.getElementsByClassName('submit')[0];
    button.click();
};

const addPin = (val: number): void => {
    const input: HTMLInputElement = (container.getElementsByClassName('pin-input')[0]: any);
    const maxInputLength = 9;

    if (input.value.length < maxInputLength) {
        input.value += val;

        if (input.value.length > 0) {
            isSubmitButtonDisabled(false);
        }
    }
};

const backspacePin = (): void => {
    const input: HTMLInputElement = (container.getElementsByClassName('pin-input')[0]: any);
    const pin = input.value;

    input.value = pin.substring(0, pin.length - 1);

    if (!input.value) {
        isSubmitButtonDisabled(true);
    }
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
            addPin(1);
            break;
        case 50 :
        case 98 :
            addPin(2);
            break;
        case 51 :
        case 99 :
            addPin(3);
            break;
        case 52 :
        case 100 :
            addPin(4);
            break;
        case 53 :
        case 101 :
            addPin(5);
            break;
        case 54 :
        case 102 :
            addPin(6);
            break;
        case 55 :
        case 103 :
            addPin(7);
            break;
        case 56 :
        case 104 :
            addPin(8);
            break;
        case 57 :
        case 105 :
            addPin(9);
            break;
    }
};

export const initPinView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('pin');

    const deviceName: HTMLElement = container.getElementsByClassName('device-name')[0];
    const input: HTMLInputElement = (container.getElementsByClassName('pin-input')[0]: any);
    const enter: HTMLElement = container.getElementsByClassName('submit')[0];
    const backspace: HTMLElement = container.getElementsByClassName('pin-backspace')[0];
    const buttons: NodeList<HTMLElement> = container.querySelectorAll('[data-value]');

    deviceName.innerText = payload.device.label;

    for (let i = 0; i < buttons.length; i++) {
        buttons.item(i).addEventListener('click', (event: MouseEvent) => {
            if (event.target instanceof HTMLElement) {
                const val: ?string = event.target.getAttribute('data-value');
                if (val) {
                    addPin(+val);
                }
            }
        });
    }

    backspace.addEventListener('click', backspacePin);

    enter.addEventListener('click', (event: MouseEvent) => {
        if (input.value.length > 0) {
            window.removeEventListener('keydown', pinKeyboardHandler, false);

            showView('loader');
            postMessage(UiMessage(UI.RECEIVE_PIN, input.value));
        }
    });

    window.addEventListener('keydown', pinKeyboardHandler, false);
};
