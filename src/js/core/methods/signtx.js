/* @flow */
'use strict';

import { checkPermissions } from './permissions';
import type { MethodParams, MethodCallbacks } from './parameters';
import BitcoreBackend, { create as createBackend } from '../../backend/BitcoreBackend';
import { getCoinInfoByCurrency } from '../../backend/CoinInfo';
import type { CoinInfo } from '../../backend/CoinInfo';
import {
    Transaction as BitcoinJsTransaction,
} from 'bitcoinjs-lib-zcash';
import * as trezor from '../../device/trezorTypes';
import type { MessageResponse } from '../../device/DeviceCommands';
import TransactionComposer from '../../tx/TransactionComposer';

const method = async (params: MethodParams, callbacks: MethodCallbacks): Promise<Object> => {
    const input: Object = params.input;
    const coinInfo: CoinInfo = input.coinInfo;
    const backend: BitcoreBackend = await createBackend(coinInfo.name);

    const txComposer: TransactionComposer = new TransactionComposer();

    const refTx: Array<BitcoinJsTransaction> = await txComposer.getReferencedTx(input.tx.transaction.inputs, backend);
    const signedtx: MessageResponse<trezor.SignedTx> = await callbacks.device.getCommands().signTx(input.tx, refTx, coinInfo, 0);

    let txId: string;
    if (input.pushTransaction) {
        try {
            txId = await backend.sendTransactionHex(signedtx.message.serialized.serialized_tx);
        } catch (error) {
            const obj: Object = {
                custom: true,
                error: error.message,
                ...signedtx.message.serialized,
            };
            throw obj;
        }
    }

    return {
        txid: txId,
        ...signedtx.message.serialized,
    };
};

const confirmation = async (params: MethodParams, callbacks: MethodCallbacks): Promise<boolean> => {
    // empty
    return true;
};

/**
 * Processing incoming message.
 * This method is async that's why it returns Promise but the real response is passed by postMessage(new ResponseMessage)
 * @param {Object} raw
 * @returns {MethodParams}
 */
const params = (raw: Object): MethodParams => {
    const permissions: Array<string> = checkPermissions(['write']);
    const requiredFirmware: string = '1.5.0';

    // validate coin
    const coinInfo: ?CoinInfo = getCoinInfoByCurrency(typeof raw.coin === 'string' ? raw.coin : 'Bitcoin');
    if (!coinInfo) {
        throw new Error(`Coin ${raw.coin} not found`);
    }

    return {
        responseID: raw.id,
        name: 'custom',
        useUi: true,
        useDevice: true,
        requiredFirmware,
        requiredPermissions: permissions,
        confirmation: null,
        method,
        input: {
            tx: raw.tx,
            coinInfo: coinInfo,
            pushTransaction: raw.push,
        },
    };
};

export default {
    method,
    confirmation,
    params,
};
