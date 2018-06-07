/* @flow */
'use strict';

import { UiMessage } from '../../core/CoreMessage';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { RequestPassphrase } from 'flowtype/ui-message';

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
        // selected part: 'Wo'
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

const isAscii = (str: string) => {
    return /^[\x08\x00-\x7F]$/.test(str);
};

export const initPassphraseView = (payload: $PropertyType<RequestPassphrase, 'payload'>): void => {
    showView('passphrase');

    const view: HTMLElement = container.getElementsByClassName('passphrase')[0];
    const header: HTMLElement = container.getElementsByTagName('h3')[0];
    const input1: HTMLInputElement = (container.getElementsByClassName('pass')[0]: any);
    const input2: HTMLInputElement = (container.getElementsByClassName('pass-check')[0]: any);
    const toggle: HTMLInputElement = (container.getElementsByClassName('show-passphrase')[0]: any);
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
    const handleInput = (input: HTMLInputElement, isPassphrase: boolean): void => {
        // The input value is either '••••X•••' where 'X' is newData or '•••••••'
        // The second case happens only when user deleted a substring
        const findAllDotsRegex = new RegExp(DOT, 'g');
        const newData = input.value.replace(findAllDotsRegex, '');

        if (newData && !isAscii(newData)) {
            // Don't let user add non-ascii chars
            input.value = isPassphrase ? passphrase : passphraseRevision;
            if (inputType === 'password') {
                input.value = DOT.repeat(input.value.length);
            }
            return;
        }

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
        input.value = isPassphrase ? passphrase : passphraseRevision;
        if (inputType === 'password') {
            input.value = DOT.repeat(input.value.length);

            // Caret must be set manually because setting an input.value will move caret at the end
            input.selectionStart = caretStart;
            input.selectionEnd = caretEnd;
        }
    };
    const handleInputKeyUp = (e: KeyboardEvent) => {
        const input: HTMLInputElement = (e.target: any);
        updateCaretForInput(input);
    };
    const validation = () => {
        if (passphrase !== passphraseRevision) {
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

        window.removeEventListener('keydown', handleWindowKeydown);

        showView('loader');
        postMessage(new UiMessage(UI.RECEIVE_PASSPHRASE, {
            save: true,
            value: passphrase,
        }));
    };
    const handleWindowKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            enter.click();
        }
    };
    const handleInputFocus = (e: Event) => {
        const input: HTMLInputElement = (e.target: any);
        updateCaretForInput(input);

        if (inputType === 'text') {
            // Hide passphrase if visible
            toggle.click();
        }
    }
    /* Functions: END */

    input1.addEventListener('copy', handleInputCopyOrPaste);
    input2.addEventListener('copy', handleInputCopyOrPaste);

    input1.addEventListener('paste', handleInputCopyOrPaste);
    input2.addEventListener('paste', handleInputCopyOrPaste);

    input1.addEventListener('input', () => handleInput(input1, true));
    input2.addEventListener('input', () => handleInput(input2, false));
    input1.addEventListener('input', validation, false);
    input2.addEventListener('input', validation, false);

    input1.addEventListener('click', (e: any) => updateCaretForInput(e.target));
    input2.addEventListener('click', (e: any) => updateCaretForInput(e.target));

    input2.addEventListener('focus', handleInputFocus);
    input1.addEventListener('focus', handleInputFocus);

    input1.addEventListener('keyup', handleInputKeyUp)
    input2.addEventListener('keyup', handleInputKeyUp)

    toggle.addEventListener('click', handleToggleClick);

    enter.addEventListener('click', handleEnterClick);

    window.addEventListener('keydown', handleWindowKeydown, false);

    input1.focus();
};
