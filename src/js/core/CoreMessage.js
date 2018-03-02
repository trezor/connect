/* @flow */
'use strict';

export const UI_EVENT: string = 'UI_EVENT';
export const DEVICE_EVENT: string = 'DEVICE_EVENT';
export const RESPONSE_EVENT: string = 'RESPONSE_EVENT';
export const ERROR_EVENT: string = 'ERROR_EVENT';

export interface CoreMessage {
    event: string,
    type: string,
    id?: number, // response id
    success?: boolean,
    data?: Object,
    error?: Object,
    // from popup
    args?: string,
    level?: string,
}

export type UiPromiseResponse = {
    event: string,
    data: any,
}

// parse MessageEvent .data object into CoreMessage
export const parseMessage = (data: any): CoreMessage => {
    return {
        event: data.event,
        type: data.type,
        id: data.id,
        success: data.success,
        data: data.data,
        error: data.error,
        args: data.args,
        level: data.level,
    };
};

export class UiMessage implements CoreMessage {
    event: string;
    type: string;
    data: Object;
    constructor(type: string, data: any = null) {
        this.event = UI_EVENT;
        this.type = type;
        this.data = data;
    }
}

export class DeviceMessage implements CoreMessage {
    event: string;
    type: string;
    data: Object;
    constructor(type: string, data: any = null) {
        this.event = DEVICE_EVENT;
        this.type = type;
        this.data = data;
    }
}

export class ResponseMessage implements CoreMessage {
    event: string;
    type: string;
    id: number;
    success: boolean;
    data: Object;
    error: Object;
    constructor(id: number, success: boolean, data: any = null) {
        this.event = RESPONSE_EVENT;
        this.type = RESPONSE_EVENT;
        this.id = id;
        this.success = success;
        this.data = data;
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
