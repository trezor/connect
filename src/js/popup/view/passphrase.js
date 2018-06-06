/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';

const addStringAt = (original: string, toAdd: string, startCaret: number, endCaret: number): string => {
    let newString = '';

    if (startCaret === endCaret) {
        // Insert substring between two chars
        // i.e.: User clicked either at the start, middle or at the end of a string

        // original: 'Hello World', toAdd: 'Hello', startCaret: 6, endCaret: 6
        // new string: 'Hello HelloWorld'

        newString = original.substr(0, startCaret) + toAdd + original.substr(startCaret);
    } else {
        // Replace chars of the original string with the new string
        // i.e. User selected a susbtring and pressed ctrl+v
        // the new string may be longer than the selection

        // original: 'Hello World', toAdd: 'Hello', startCaret: 6, endCaret: 8
        // selected part: 'World'
        // new string: 'Hello Hellorld'

        newString = original.substr(0, startCaret) + toAdd + original.substr(endCaret);
    }
    return newString;
};

const removeStringAt = (original: string, startCaret: number, endCaret: number): string => {
    let newString = '';

    if (startCaret === endCaret) {
        // Delete a single character
        // original: 'Hello World', startCaret: 6, endCaret: 6
        // new string: 'HelloWorld'

        newString = original.substr(0, startCaret - 1) + original.substr(startCaret);
    } else {
        // Delete a selection of multiple characters
        // original: 'Hello World', startCaret: 6, endCaret: 8
        // new string: 'Hello rld'

        newString = original.substr(0, startCaret) + original.substr(endCaret);
    }

    return newString;
};

const handleInputCopyOrPaste = (e: Event) => {
    e.preventDefault();
};

export const initPassphraseView = (payload: any): void => {
    showView('passphrase');

    const view: HTMLElement = container.getElementsByClassName('passphrase')[0];
    const header: HTMLElement = container.getElementsByTagName('h3')[0];
    const input1: HTMLInputElement = (container.getElementsByClassName('pass')[0]: any);
    const input2: HTMLInputElement = (container.getElementsByClassName('pass-check')[0]: any);
    const toggle: HTMLElement = container.getElementsByClassName('show-passphrase')[0];
    const enter: HTMLButtonElement = ( container.getElementsByClassName('submit')[0]: any);

    const DOT: string = '•';

    // Only single input can be selected at one time
    let caretStart: number = -1;
    let caretEnd: number = -1;

    let inputType: string = 'password';

    let passphrase: string = '';
    let passphraseRevision: string = '';

    header.innerHTML = header.innerHTML.replace('#TREZOR', payload.device.label);

    /* Functions */
    const updateCaretForInput = (input: HTMLInputElement) => {
        caretStart = input.selectionStart;
        caretEnd = input.selectionEnd;
    };
    const handleInput = (newData: string, input: HTMLInputElement, isPassphrase: boolean): void => {
        if (isPassphrase) {
            if (newData) {
                // User added character(s)
                passphrase = addStringAt(passphrase, newData, caretStart, caretEnd);
            } else {
                // User deleted character(s)
                passphrase = removeStringAt(passphrase, caretStart, caretEnd);
            }
        } else {
            if (newData) {
                // User added character(s)
                passphraseRevision = addStringAt(passphraseRevision, newData, caretStart, caretEnd);
            } else {
                // User deleted character(s)
                passphraseRevision = removeStringAt(passphraseRevision, caretStart, caretEnd);
            }
        }

        // Value was changed - caret must be refreshed
        updateCaretForInput(input);
        if (inputType === 'password') {
            input.value = DOT.repeat(input.value.length);

            // Caret must be set manually because setting an input.value will caret move at the end
            input.selectionStart = caretStart;
            input.selectionEnd = caretEnd;
        }
    };
    const handleInputKeyUp = (e: KeyboardEvent) => {
        const input: HTMLInputElement = (e.target: any);
        switch (e.code) {
            case ('ArrowLeft' || 'ArrowUp' || 'ArrowRight' || 'ArrowDown' || 'Backspace'):
                updateCaretForInput(input);
                break;
            default:
                updateCaretForInput(input);
                break;
        }
    };
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
        if (inputType === 'text') {
            // Was plain text, now show dots
            input1.value = DOT.repeat(input1.value.length);
            input2.value = DOT.repeat(input2.value.length);

            inputType = 'password';
        } else {
            // Was dots, now show plain text
            input1.value = passphrase;
            input2.value = passphraseRevision;

            inputType = 'text';
        }
    };
    const handleEnterClick = () => {
        input1.blur();
        input2.blur();

        // TODO: Cleanup
        window.removeEventListener('keydown', handleWindowKeydown);
        input1.removeEventListener('input', validation, false);
        input2.removeEventListener('input', validation, false);

        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PASSPHRASE, {
            save: true,
            value: passphrase,
        }));
    };
    const handleWindowKeydown = (e: KeyboardEvent) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            enter.click();
        }
    };
    /* Functions: END */

    input1.addEventListener('copy', handleInputCopyOrPaste);
    input2.addEventListener('copy', handleInputCopyOrPaste);

    input1.addEventListener('paste', handleInputCopyOrPaste);
    input2.addEventListener('paste', handleInputCopyOrPaste);

    input1.addEventListener('input', (e: any) => handleInput(e.data, input1, true));
    input2.addEventListener('input', (e: any) => handleInput(e.data, input2, false));
    input1.addEventListener('input', validation, false);
    input2.addEventListener('input', validation, false);

    input1.addEventListener('click', (e: any) => updateCaretForInput(e.target));
    input2.addEventListener('click', (e: any) => updateCaretForInput(e.target));

    input2.addEventListener('focus', (e: any) => updateCaretForInput(e.target));
    input1.addEventListener('focus', (e: any) => updateCaretForInput(e.target));

    input1.addEventListener('keyup', handleInputKeyUp)
    input2.addEventListener('keyup', handleInputKeyUp)

    toggle.addEventListener('click', handleToggleClick);

    enter.addEventListener('click', handleEnterClick);

    window.addEventListener('keydown', handleWindowKeydown, false);

    input1.focus();
};
