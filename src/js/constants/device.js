/* @flow */
'use strict';

// device list events
export const CONNECT: string = 'device__connect';
export const CONNECT_UNACQUIRED: string = 'device__connect_unacquired';
export const DISCONNECT: string = 'device__disconnect';
export const DISCONNECT_UNACQUIRED: string = 'device__disconnect_unacquired';

export const ACQUIRE: string = 'device__acquire';
export const RELEASE: string = 'device__release';
export const ACQUIRED: string = 'device__acquired';
export const RELEASED: string = 'device__released';
export const USED_ELSEWHERE: string = 'device__used_elsewhere';
export const CHANGED: string = 'device__changed';

export const LOADING: string = 'device__loading';

// trezor-link events
export const BUTTON: string = 'button';
export const PIN: string = 'pin';
export const PASSPHRASE: string = 'passphrase';
export const WORD: string = 'word';

// custom
export const AUTHENTICATED: string = 'device__authenticated';

export const WAIT_FOR_SELECTION: string = 'device__wait_for_selection';
