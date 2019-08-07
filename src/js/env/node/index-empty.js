/* @flow */
import EventEmitter from 'events';

const empty = () => {
    throw new Error('This version of trezor-connect is not suitable to work without browser');
};

export const eventEmitter = new EventEmitter();
export const manifest = empty;
export const init = empty;
export const call = empty;
export const getSettings = empty;
export const customMessage = empty;
export const requestLogin = empty;
export const uiResponse = empty;
export const renderWebUSBButton = empty;
export const cancel = empty;
export const dispose = empty;
