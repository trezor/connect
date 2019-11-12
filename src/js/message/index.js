/* @flow */

import type { CoreMessage } from '../types';

// parse MessageEvent .data into CoreMessage
export const parseMessage = (messageData: any): CoreMessage => {
    const message: CoreMessage = {
        event: messageData.event,
        type: messageData.type,
        payload: messageData.payload,
    };

    if (typeof messageData.id === 'number') {
        message.id = messageData.id;
    }

    if (typeof messageData.success === 'boolean') {
        message.success = messageData.success;
    }

    return message;
};
