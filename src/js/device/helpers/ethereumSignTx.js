/* @flow */
'use strict';

import type { EthereumTxRequest } from 'flowtype/trezor';
import type { MessageResponse, DefaultMessageResponse } from '../DeviceCommands';

export type EthereumSignature = {
  v: number,
  r: string,
  s: string,
};

const splitString = (str: ?string, len: number): [string, string] => {
    if (str == null) {
        return ['', ''];
    }
    const first = str.slice(0, len);
    const second = str.slice(len);
    return [first, second];
};

const processTxRequest = async (
    typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    request: EthereumTxRequest,
    data: ?string
): Promise<EthereumSignature> => {
    if (!request.data_length) {
        const v = request.signature_v;
        const r = request.signature_r;
        const s = request.signature_s;
        if (v == null || r == null || s == null) {
            throw new Error('Unexpected request.');
        }

        return Promise.resolve({
            v, r, s,
        });
    }

    const [first, rest] = splitString(data, request.data_length * 2);
    const response: DefaultMessageResponse = await typedCall('EthereumTxAck', 'EthereumTxRequest', { data_chunk: first });

    return await processTxRequest(
        typedCall,
        response.message,
        rest
    );
};

function stripLeadingZeroes(str: string) {
    while (/^00/.test(str)) {
        str = str.slice(2);
    }
    return str;
}

export const ethereumSignTx = async (
    typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    address_n: Array<number>,
    nonce: string,
    gas_price: string,
    gas_limit: string,
    to: string,
    value: string,
    data?: string,
    chain_id?: number
): Promise<EthereumSignature> => {
    const length = data == null ? 0 : data.length / 2;

    const [first, rest] = splitString(data, 1024 * 2);

    let message = {
        address_n,
        nonce: stripLeadingZeroes(nonce),
        gas_price: stripLeadingZeroes(gas_price),
        gas_limit: stripLeadingZeroes(gas_limit),
        to,
        value: stripLeadingZeroes(value),
    };

    if (length !== 0) {
        message = {
            ...message,
            data_length: length,
            data_initial_chunk: first,
        };
    }

    if (chain_id != null) {
        message = {
            ...message,
            chain_id,
        };
    }

    const response: DefaultMessageResponse = await typedCall('EthereumSignTx', 'EthereumTxRequest', message);
    // return session.typedCall('EthereumSignTx', 'EthereumTxRequest', message).then((res) =>
    //     processTxRequest(session, res.message, rest)
    // );

    return await processTxRequest(
        typedCall,
        response.message,
        rest
    );
};
