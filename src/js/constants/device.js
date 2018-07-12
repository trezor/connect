/* @flow */
'use strict';

// Regexp for flowtype
// replace ": '(.*)' = '(.*)';" to ": '$1' = '$1';"
// replace "export const " to ""


// device list events
export const CONNECT: 'device__connect' = 'device__connect';
export const CONNECT_UNACQUIRED: 'device__connect_unacquired' = 'device__connect_unacquired';
export const DISCONNECT: 'device__disconnect' = 'device__disconnect';
export const DISCONNECT_UNACQUIRED: 'device__disconnect_unacquired' = 'device__disconnect_unacquired';

export const ACQUIRE: 'device__acquire' = 'device__acquire';
export const RELEASE: 'device__release' = 'device__release';
export const ACQUIRED: 'device__acquired' = 'device__acquired';
export const RELEASED: 'device__released' = 'device__released';
export const USED_ELSEWHERE: 'device__used_elsewhere' = 'device__used_elsewhere';
export const CHANGED: 'device__changed' = 'device__changed';

export const LOADING: 'device__loading' = 'device__loading';

// trezor-link events
export const BUTTON: 'button' = 'button';
export const PIN: 'pin' = 'pin';
export const PASSPHRASE: 'passphrase' = 'passphrase';
export const PASSPHRASE_ON_DEVICE: 'passphrase_on_device' = 'passphrase_on_device';
export const WORD: 'word' = 'word';

// custom
export const WAIT_FOR_SELECTION: 'device__wait_for_selection' = 'device__wait_for_selection';

export const UNREADABLE: 'unreadable-device' = 'unreadable-device'; // this string has different form than other constants because it is used as unreadable device path
