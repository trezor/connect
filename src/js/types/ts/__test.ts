/* eslint-disable flowtype/no-types-missing-file-annotation */

import { API } from './api';
import { Address } from './bitcoin';

let TrezorConnect: API;

export const getAddress = async () => {
    const result: Address[] = [];
    // regular
    const single = await TrezorConnect.getAddress({ path: 'a' });
    if (single.success) {
        result.push(single.payload);

        // @ts-ignore: bundle not exists
        single.payload.forEach(item => {
            result.push(item);
        });
    }

    // bundle
    const bundle = await TrezorConnect.getAddress({ bundle: [{ path: 'a' }] });
    if (bundle.success) {
        bundle.payload.forEach(item => {
            result.push(item);
        });
        // @ts-ignore: payload is an array
        result.push(bundle.payload);
    } else {
        // r2.payload.error;
    }

    // invalid
    // @ts-ignore no bundle
    TrezorConnect.getAddress([{ path: 'a' }]);
    // @ts-ignore no path with common only
    TrezorConnect.getAddress({ keepSession: true });
};

export const requestLogin = async () => {
    const callback = () => ({
        challengeHidden: 'string',
        challengeVisual: 'string',
    });

    TrezorConnect.requestLogin({ callback, useEmptyPassphrase: true });
    TrezorConnect.requestLogin({ challengeHidden: 'string', challengeVisual: 'string' });
    // invalid
    // @ts-ignore invalid params
    TrezorConnect.requestLogin({ });
    // @ts-ignore common only
    TrezorConnect.getAddress({ keepSession: true });
};

export const events = async () => {
    TrezorConnect.on('DEVICE_EVENT', event => {
        event.type === 'device-connect';
        // @ts-ignore expected
        event.type === 'unknown';
    });

    TrezorConnect.on('TRANSPORT_EVENT', event => {
        event.type === 'transport-error';
        // @ts-ignore expected
        event.type === 'unknown';
    });
};
