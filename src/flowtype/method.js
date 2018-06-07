import type { Deferred, UiPromiseResponse, CoreMessage } from 'flowtype';

declare module 'flowtype/method' {

    declare export type MethodParams = {
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
        useEmptyPassphrase?: boolean;
    }

    declare export type MethodCallbacks = {
        device: Device,
        postMessage: (message: CoreMessage) => void,
        getPopupPromise: () => Deferred<void>,
        createUiPromise: (promiseId: string, device?: Device) => Deferred<UiPromiseResponse>,
        findUiPromise: (callId: number, promiseId: string) => ?Deferred<UiPromiseResponse>,
        removeUiPromise: (promise: Deferred<UiPromiseResponse>) => void,
    }

    declare export type Method = (params: MethodParams, callbacks: MethodCallbacks) => Promise<Object>;
}



