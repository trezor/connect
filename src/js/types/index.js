/* @flow */

export * from './api';
export * from './events';
export * from './misc';
export * from './params';

export * from './account';
export * from './trezor/device';
export * from './trezor/management';

export * from './networks/bitcoin';
export * from './networks/binance';
export * from './networks/cardano';
export * from './networks/coinInfo';
export * from './networks/eos';
export * from './networks/ethereum';
export * from './networks/lisk';
export * from './networks/nem';
export * from './networks/ripple';
export * from './networks/stellar';
export * from './networks/tezos';

export * from './backend/blockchain';
export * from './backend/transactions';

export type CoreMessage = {
    +event: string;
    +type: string;
    +payload: any;

    id?: number; // response id in ResponseMessage
    success?: boolean; // response status in ResponseMessage
};

export type UiPromiseResponse = {
    event: string;
    payload: any;
};

// Override MessageEvent type to have access to "ports" field and typed "data"
export interface PostMessageEvent extends Event {
    +origin: string;
    +lastEventId: string;
    +source: WindowProxy;
    +ports: Array<MessagePort>;
    +data: ?CoreMessage;
}

export type Deferred<T> = {
    id?: string;
    device: ?any;
    promise: Promise<T>;
    resolve: (t: T) => void;
    reject: (e: Error) => void;
}
