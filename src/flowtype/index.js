/* @flow */

// empty module for css/less imports
declare module 'CSSModule' {
    declare var exports: { [key: string]: string };
}

// this needs to be toplevel
declare type $Core$Message = {
    +event: string,
    +type: string,
    +payload: any,

    id?: number, // response id in ResponseMessage
    success?: boolean, // response status in ResponseMessage
}

// Override MessageEvent to have access to "ports" field and typed "data"
declare class Message extends Event {
    +origin: string;
    +lastEventId: string;
    +source: WindowProxy;
    +ports: Array<MessagePort>;
    +data: ?$Core$Message;
}

// Override Navigator to have access to "usb" field
declare var navigator: Navigator & {
    +usb?: USB;
};

// Common types used across library
declare module 'flowtype' {
    declare export type Deferred<T> = {
        id?: string,
        device: ?any,
        promise: Promise<T>,
        resolve: (t: T) => void,
        reject: (e: Error) => void,
    };

    declare export type UiPromiseResponse = {
        event: string,
        payload: any,
    }

    declare export type PostMessageData = {
        event: string,
        type: string,
        payload?: any
    }

    declare export type CoreMessage = $Core$Message;

    declare export type BrowserState = {
        name: string;
        osname: string;
        supported: boolean;
        outdated: boolean;
        mobile: boolean;
    }

    declare export type BrowserState = {
        name: string;
        osname: string;
        supported: boolean;
        outdated: boolean;
        mobile: boolean;
    }
}
