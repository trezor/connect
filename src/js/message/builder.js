/* @flow */
'use strict';

import { UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT, RESPONSE_EVENT } from '../constants';
import type { CoreMessage } from '../types';
import type { UiMessageFactory } from '../types/ui-request';

export const UiMessage: UiMessageFactory = (type, payload) => {
    return {
        event: UI_EVENT,
        type,
        payload,
    };
};

export const DeviceMessage = (type: string, payload: any): CoreMessage => {
    return {
        event: DEVICE_EVENT,
        type,
        payload,
    };
};

export const TransportMessage = (type: string, payload: any): CoreMessage => {
    return {
        event: TRANSPORT_EVENT,
        type,
        payload,
    };
};

export const ResponseMessage = (id: number, success: boolean, payload: any = null): CoreMessage => {
    return {
        event: RESPONSE_EVENT,
        type: RESPONSE_EVENT,
        id,
        success,
        payload,
    };
};
