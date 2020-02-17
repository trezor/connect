/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { DeviceMessage } from '../../types/events';
import bipWords from '../../utils/bip39';

const initWordPlainView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('word-plain');

    const deviceName: HTMLElement = container.getElementsByClassName('device-name')[0];
    const datalist: HTMLElement = container.getElementsByClassName('bip-words')[0];
    const input: HTMLInputElement = (container.getElementsByClassName('word-input')[0]: any);
    deviceName.innerText = payload.device.label;

    const clearWord = (): void => {
        input.value = '';
        input.focus();
    };

    const submit = (): void => {
        postMessage(UiMessage(UI.RECEIVE_WORD, input.value));
        clearWord();
        // eslint-disable-next-line no-use-before-define
        window.removeEventListener('keydown', wordKeyboardHandler);
    };

    const wordKeyboardHandler = (event: KeyboardEvent): void => {
        switch (event.keyCode) {
            case 13: // enter,
            case 9: // tab
                event.preventDefault();
                submit();
                break;
        }
    };

    bipWords.forEach((word: string) => {
        const item = document.createElement('option');
        item.value = word;
        datalist.appendChild(item);
    });

    input.focus();

    window.addEventListener('keydown', wordKeyboardHandler, false);
};

const initWordMatrixView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('word-matrix');

    const submit = (val): void => {
        postMessage(UiMessage(UI.RECEIVE_WORD, val));
        // eslint-disable-next-line no-use-before-define
        window.addEventListener('keydown', keyboardHandler, true);
    };

    const keyboardHandler = (event: KeyboardEvent): void => {
        event.preventDefault();
        switch (event.keyCode) {
            // numeric and numpad
            case 49 :
            case 97 :
                submit('1');
                break;
            case 50 :
            case 98 :
                submit('2');
                break;
            case 51 :
            case 99 :
                submit('3');
                break;
            case 52 :
            case 100 :
                submit('4');
                break;
            case 53 :
            case 101 :
                submit('5');
                break;
            case 54 :
            case 102 :
                submit('6');
                break;
            case 55 :
            case 103 :
                submit('7');
                break;
            case 56 :
            case 104 :
                submit('8');
                break;
            case 57 :
            case 105 :
                submit('9');
                break;
        }
    };

    const deviceName: HTMLElement = container.getElementsByClassName('device-name')[0];
    const buttons: NodeList<HTMLElement> = container.querySelectorAll('[data-value]');
    const wordsOnRight: HTMLCollection<HTMLElement> = container.getElementsByClassName('word-right');

    deviceName.innerText = payload.device.label;

    for (let i = 0; i < buttons.length; i++) {
        buttons.item(i).addEventListener('click', (event: MouseEvent) => {
            if (event.target instanceof HTMLElement) {
                const val: ?string = event.target.getAttribute('data-value');
                if (val) {
                    submit(val);
                }
            }
        });
    }

    for (const word of wordsOnRight) {
        word.style.display = payload.type !== 'WordRequestType_Matrix9' ? 'none' : 'initial';
    }

    window.addEventListener('keydown', keyboardHandler, true);
};

export const initWordView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    if (payload.type === 'WordRequestType_Plain') {
        initWordPlainView(payload);
    } else {
        initWordMatrixView(payload);
    }
};
