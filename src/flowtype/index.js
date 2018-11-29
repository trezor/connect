/* @flow */

// empty module for css/less imports
declare module 'CSSModule' {
    declare var exports: { [key: string]: string };
}

// Override Navigator to have access to "usb" field
declare var navigator: Navigator & {
    +usb?: USB,
};

declare type ChromeTab = {
    id: number,
    index: number,
}

declare type ChromePort = {
    name: string,
    onMessage: (message: Object) => void,
    postMessage: (message: Object) => void,
    sender: any,
    disconnect: () => void,
}

/* eslint-disable no-redeclare */
declare function $RuntimeSendMessage(message: any, options: Object, callback: () => void): void;
declare function $RuntimeSendMessage(id: string, message: any, options: ?Object, callback: () => void): void;
/* eslint-enable no-redeclare */

declare var chrome: {
    runtime: {
        id: string,
        onConnect: {
            addListener: ((port: ChromePort) => void) => void,
            removeListener: ((port: ChromePort) => void) => void,
        },
        sendMessage: typeof $RuntimeSendMessage,
        lastError?: string,
    },
    tabs: {
        create: ({
            url?: string,
            index?: number,
        }, callback?: (tab: ?ChromeTab) => void) => void,
        get: (id: number, callback: (tab: ?ChromeTab) => void) => void,
        highlight: (options: Object, callback?: () => void) => void,
        update: (id: number, options: Object) => void,
        remove: (id: number) => void,
    },
}

declare interface BroadcastChannel {
    constructor: (id: string) => void,
    onmessage: (message: Object) => void,
    postMessage: (message: Object) => void,
}
