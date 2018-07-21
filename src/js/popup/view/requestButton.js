/* @flow */
'use strict';

import { showView } from './common';

export const requestButton = (data: Object): void => {
    if (data.code === 'ButtonRequest_ConfirmOutput') {
        showView('check-address');
    } else if (data.code === 'ButtonRequest_Address') {
        showView('check-address');
    } else {
        showView('follow-device');
    }
};
