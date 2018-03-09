/* @flow */
'use strict';

export const UI_EVENT: string = 'UI_EVENT';
export const DEVICE_EVENT: string = 'DEVICE_EVENT';
export const TRANSPORT_EVENT: string = 'TRANSPORT_EVENT';
export const RESPONSE_EVENT: string = 'RESPONSE_EVENT';
export const ERROR_EVENT: string = 'ERROR_EVENT';

export interface CoreMessage {
    +event: string,
    +type: string,
    id?: number, // response id
    success?: boolean,
    payload?: any,
}

export type UiPromiseResponse = {
    event: string,
    payload: any,
}

// parse MessageEvent .data object into CoreMessage
export const parseMessage = (messageData: any): CoreMessage => {
    const message: CoreMessage = {
        event: messageData.event,
        type: messageData.type,
    }

    if (messageData.hasOwnProperty('id') && typeof messageData.id === 'number') {
        message.id = messageData.id;
    }

    if (messageData.hasOwnProperty('success') && typeof messageData.success === 'boolean') {
        message.success = messageData.success;
    }

    if (messageData.hasOwnProperty('payload')) {
        message.payload = messageData.payload;
    }

    return message;
};

export class UiMessage implements CoreMessage {
    event: string;
    type: string;
    payload: Object;
    constructor(type: string, payload: any = null) {
        this.event = UI_EVENT;
        this.type = type;
        this.payload = payload;
    }
}

export class DeviceMessage implements CoreMessage {
    event: string;
    type: string;
    payload: Object;
    constructor(type: string, payload: any = null) {
        this.event = DEVICE_EVENT;
        this.type = type;
        this.payload = payload;
    }
}

export class TransportMessage implements CoreMessage {
    event: string;
    type: string;
    payload: Object;
    constructor(type: string, payload: any = null) {
        this.event = TRANSPORT_EVENT;
        this.type = type;
        this.payload = payload;
    }
}

export class ResponseMessage implements CoreMessage {
    event: string;
    type: string;
    id: number;
    success: boolean;
    payload: Object;
    constructor(id: number, success: boolean, payload: any = null) {
        this.event = RESPONSE_EVENT;
        this.type = RESPONSE_EVENT;
        this.id = id;
        this.success = success;
        this.payload = payload;
    }
}

export class ErrorMessage implements CoreMessage {
    event: string;
    type: string;
    error: Object;
    constructor(error: any = null) {
        this.event = ERROR_EVENT;
        this.type = ERROR_EVENT;
        this.error = error;
    }
}
