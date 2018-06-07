// import css/less module
declare module 'CSSModule' {
    declare var exports: { [key: string]: string };
}

// Override MessageEvent to have access to "ports" and typed "data"
declare class Message extends Event {
    origin: string;
    lastEventId: string;
    source: WindowProxy;
    ports: Array<MessagePort>;
    data: {
        event: string;
        type: string;
        payload: any;
    }
}

// Override Navigator to have access to "usb" field
declare var navigator: Navigator & {
    usb?: USB;
};

// Types
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

    declare export type CoreMessage = {
        event: string,
        type: string,
        payload: any
    }

    declare export type BrowserState = {
        name: string;
        osname: string;
        supported: boolean;
        outdated: boolean;
        mobile: boolean;
    }
}
