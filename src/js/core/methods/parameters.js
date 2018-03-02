/* @flow */
'use strict';

import Device from '../../device/Device';
import type { CoreMessage, UiPromiseResponse } from '../CoreMessage';
import type { Deferred } from '../../utils/deferred';

import { find as findMethod } from './index';

export interface MethodParams {
    responseID: number, // call id
    deviceHID?: string, // device id

    name: string, // method name
    useUi: boolean, //
    useDevice: boolean, // use device
    requiredFirmware: string,
    // method for requesting permissions from user [optional]
    requiredPermissions: Array<string>,
    // method for requesting confirmation from user [optional]
    confirmation: any,
    // confirmation: ConfirmationMethod | any;
    // main method called inside Device.run
    method: Method,
    // parsed input parameters
    input: Object,
    // session should be released?
    keepSession?: boolean,

    deviceInstance?: string,
}

export interface GeneralParams {
    +responseID: number;
    +deviceHID: ?string;
    +deviceInstance: number;
    +deviceState: ?string;
    +keepSession: boolean;
    +methodParams: MethodParams;
}

export interface MethodCallbacks {
    device: Device,
    postMessage: (message: CoreMessage) => void,
    getPopupPromise: () => Deferred<void>,
    createUiPromise: (callId: number, promiseId: string) => Deferred<UiPromiseResponse>,
    findUiPromise: (callId: number, promiseId: string) => ?Deferred<UiPromiseResponse>,
    removeUiPromise: (promise: Deferred<UiPromiseResponse>) => void,
}

export type ConfirmationMethod = (params: MethodParams, callbacks: MethodCallbacks) => Promise<boolean>;
export type Method = (params: MethodParams, callbacks: MethodCallbacks) => Promise<Object>;

export type MethodCollection = {
    method: Method,
    params: (rawParams: Object) => MethodParams,
    confirmation: ConfirmationMethod | any,
}

export const parseGeneral = (message: CoreMessage, methodParams: MethodParams): GeneralParams => {
    if (!message.data) {
        throw new Error('Data not found');
    }

    const data: Object = message.data;

    return {
        responseID: message.id || 0, // message.id,
        deviceHID: data.device ? data.device.path : null,
        deviceInstance: data.device ? data.device.instance : 0,
        deviceState: data.device ? data.device.state : null,
        keepSession: typeof data.keepSession === 'boolean' ? data.keepSession : false,
        methodParams
    }
}

export const parse = (message: CoreMessage): MethodParams => {
    if (!message.data) {
        throw new Error('Data not found');
    }

    const data: Object = { id: message.id, ...message.data };
    //
    if (!data.method || typeof data.method !== 'string') {
        throw new Error('Method not set');
    }

    // TODO: escape incomming string
    // find method collection in list
    //const method: ?MethodCollection = findMethod(data.method.toLowerCase());
    const method: ?MethodCollection = findMethod(data.method);
    if (!method) {
        throw new Error(`Method ${data.method} not found`);
    }

    // find method params
    let params: MethodParams;
    try {
        params = method.params(data);
        params.deviceHID = data.selectedDevice;
        params.deviceInstance = data.deviceInstance;

    } catch (error) {
        throw error;
    }

    return params;
};

