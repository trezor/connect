/* @flow */

import { UiMessage } from '../../message/builder';
import * as UI from '../../constants/ui';
import { container, showView, postMessage } from './common';
import type { DeviceMessage } from '../../types/events';

export const initPassphraseView = (payload: $PropertyType<DeviceMessage, 'payload'>): void => {
    showView('passphrase');

    const view: HTMLElement = container.getElementsByClassName('passphrase')[0];
    const deviceNameSpan: HTMLElement = container.getElementsByClassName('device-name')[0];
    const input1: HTMLInputElement = (container.getElementsByClassName('pass')[0]: any);
    const input2: HTMLInputElement = (container.getElementsByClassName('pass-check')[0]: any);
    const toggle: HTMLInputElement = (container.getElementsByClassName('show-passphrase')[0]: any);
    const enter: HTMLButtonElement = (container.getElementsByClassName('submit')[0]: any);

    let inputType: string = 'password';

    const { label, features } = payload.device;
    deviceNameSpan.innerText = label;
    const passphraseOnDevice = features && features.capabilities && features.capabilities.includes('Capability_PassphraseEntry');

    /* Functions */
    const validation = () => {
        if (input1.value !== input2.value) {
            enter.disabled = true;
            view.classList.add('not-valid');
        } else {
            enter.disabled = false;
            view.classList.remove('not-valid');
        }
    };
    const toggleInputFontStyle = (input: HTMLInputElement) => {
        if (inputType === 'text') {
            // input.classList.add('text');
            input.setAttribute('type', 'text');

            // Since passphrase is visible there's no need to force user to fill the passphrase twice
            // - disable input2
            // - write automatically into input2 as the user is writing into input1 (listen to input event)
            input2.disabled = true;
            input2.value = input1.value;
            validation();
        } else if (inputType === 'password') {
            // input.classList.remove('text');
            input.setAttribute('type', 'password');

            input2.disabled = false;
            input2.value = '';
            validation();
        }
    };
    const handleToggleClick = () => {
        inputType = inputType === 'text' ? 'password' : 'text';

        toggleInputFontStyle(input1);
        toggleInputFontStyle(input2);
    };
    const handleWindowKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            enter.click();
        }
    };
    const handleEnterClick = () => {
        input1.blur();
        input2.blur();
        window.removeEventListener('keydown', handleWindowKeydown);

        showView('loader');
        postMessage(UiMessage(UI.RECEIVE_PASSPHRASE, {
            value: input1.value,
            save: true,
        }));
    };

    /* Functions: END */
    input1.addEventListener('input', () => {
        validation();
        if (inputType === 'text') {
            input2.value = input1.value;
            validation();
        }
    }, false);
    input2.addEventListener('input', validation, false);

    toggle.addEventListener('click', handleToggleClick);
    enter.addEventListener('click', handleEnterClick);
    window.addEventListener('keydown', handleWindowKeydown, false);

    if (passphraseOnDevice) {
        const onDevice: HTMLButtonElement = (container.getElementsByClassName('passphraseOnDevice')[0]: any);
        onDevice.style.display = 'block';
        onDevice.addEventListener('click', () => {
            window.removeEventListener('keydown', handleWindowKeydown);
            showView('loader');
            postMessage(UiMessage(UI.RECEIVE_PASSPHRASE, {
                value: '',
                passphraseOnDevice: true,
                save: true,
            }));
        });
    }

    input1.focus();
};
