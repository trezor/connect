/* @flow */
'use strict';

import { container, showView } from './common';

export const requestButton = (data: Object): void => {
    showView('simple-message');

    const h3: HTMLElement = container.getElementsByTagName('h3')[0];
    const div: HTMLElement = container.getElementsByClassName('message')[0];

    h3.innerHTML = ''; // 'Wait for button action...';
    div.innerHTML = '';

    if (data.code === 'ButtonRequest_ConfirmOutput') {
        h3.innerHTML = 'Check recipient address on your device and follow further instructions.';
    } else {
        h3.innerHTML = 'Follow instructions on your device.';
    }
    // div.innerHTML = `Button code: ${data}`;
    // div.innerHTML = `Check recipient address on your device`;
    // TODO: message

    // ButtonRequest_ConfirmOutput
    // ButtonRequest_SignTx
};
