/* @flow */
import type { Device, CoreMessage } from './index';
import * as UI from '../constants/ui';

/*
* Messages from UI
*/

declare type ReceivePermission = {|
    +type: typeof UI.RECEIVE_PERMISSION,
    payload: {
        granted: boolean,
        remember: boolean,
    },
|}

declare type ReceiveConfirmation = {|
    +type: typeof UI.RECEIVE_CONFIRMATION,
    payload: boolean,
|}

declare type ReceiveDevice = {|
    +type: typeof UI.RECEIVE_DEVICE,
    payload: {
        device: Device,
        remember: boolean,
    },
|}

declare type ReceivePin = {|
    +type: typeof UI.RECEIVE_PIN,
    payload: string,
|}

declare type ReceiveWord = {|
    +type: typeof UI.RECEIVE_WORD,
    payload: string,
|}

declare type ReceivePassphrase = {|
    +type: typeof UI.RECEIVE_PASSPHRASE,
    payload: {
        save: boolean,
        value: string,
    },
|}

declare type ReceivePassphraseAction = {|
    +type: typeof UI.INVALID_PASSPHRASE_ACTION,
    payload: boolean,
|}

declare type ReceiveAccount = {|
    +type: typeof UI.RECEIVE_ACCOUNT,
    payload: ?number,
|}

declare type ReceiveFee = {|
    +type: typeof UI.RECEIVE_FEE,
    payload: {
        +type: 'compose-custom',
        value: number,
    } | {
        +type: 'change-account',
    } | {
        +type: 'send',
        value: string,
    },
|}

/*
* Callback message for CustomMessage method
*/

declare type CustomMessageRequest = {|
    +type: typeof UI.CUSTOM_MESSAGE_REQUEST,
    payload: {
        type: string,
        message: Object,
    },
|}

export type UiResponse =
    ReceivePermission
    | ReceiveConfirmation
    | ReceiveDevice
    | ReceivePin
    | ReceiveWord
    | ReceivePassphrase
    | ReceivePassphraseAction
    | ReceiveAccount
    | ReceiveFee
    | CustomMessageRequest;

/* eslint-disable no-redeclare */
declare function MessageFactory(type: $PropertyType<ReceivePermission, 'type'>, payload: $PropertyType<ReceivePermission, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveConfirmation, 'type'>, payload: $PropertyType<ReceiveConfirmation, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveDevice, 'type'>, payload: $PropertyType<ReceiveDevice, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceivePin, 'type'>, payload: $PropertyType<ReceivePin, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceivePassphrase, 'type'>, payload: $PropertyType<ReceivePassphrase, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceivePassphraseAction, 'type'>, payload: $PropertyType<ReceivePassphraseAction, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveAccount, 'type'>, payload: $PropertyType<ReceiveAccount, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveFee, 'type'>, payload: $PropertyType<ReceiveFee, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<CustomMessageRequest, 'type'>, payload: $PropertyType<CustomMessageRequest, 'payload'>): CoreMessage;
declare function MessageFactory(type: $PropertyType<ReceiveWord, 'type'>, payload: $PropertyType<ReceiveWord, 'payload'>): CoreMessage;
/* eslint-enable no-redeclare */

export type UiResponseFactory = typeof MessageFactory;
