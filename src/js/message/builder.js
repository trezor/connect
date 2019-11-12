/* @flow */

import { UI_EVENT, DEVICE_EVENT, TRANSPORT_EVENT, RESPONSE_EVENT, BLOCKCHAIN_EVENT } from '../constants';
import type { CoreMessage } from '../types';
import type { UiMessageFactory } from '../types/uiRequest';
import type { BlockchainMessageFactory } from '../types/blockchainEvent';

export const UiMessage: UiMessageFactory = (type, payload) => (
    {
        event: UI_EVENT,
        type,
        payload,
    }
);

export const DeviceMessage = (type: string, payload: any): CoreMessage => (
    {
        event: DEVICE_EVENT,
        type,
        payload,
    }
);

export const TransportMessage = (type: string, payload: any): CoreMessage => (
    {
        event: TRANSPORT_EVENT,
        type,
        payload,
    }
);

export const ResponseMessage = (id: number, success: boolean, payload: any = null): CoreMessage => (
    {
        event: RESPONSE_EVENT,
        type: RESPONSE_EVENT,
        id,
        success,
        payload,
    }
);

export const BlockchainMessage: BlockchainMessageFactory = (type, payload): CoreMessage => (
    {
        event: BLOCKCHAIN_EVENT,
        type,
        payload,
    }
);
