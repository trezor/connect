/* @flow */
'use strict';

import type { DefaultMessageResponse } from '../../../device/DeviceCommands';
import type { CoinInfo } from 'flowtype';
import type {
    TxRequest,
    RefTransaction,
    TransactionInput,
    TransactionOutput,
    SignTxInfoToTrezor,
    TxRequestSerialized,
    SignedTx,
} from '../../../types/trezor';

const requestPrevTxInfo = (reqTx: RefTransaction,
    requestType: string,
    requestIndex: string | number,
    dataLen: ?(string | number),
    dataOffset: ?(string | number),
): SignTxInfoToTrezor => {
    const i = +requestIndex;
    if (requestType === 'TXINPUT') {
        return {inputs: [reqTx.inputs[i]]};
    }
    if (requestType === 'TXOUTPUT') {
        return {bin_outputs: [reqTx.bin_outputs[i]]};
    }
    if (requestType === 'TXEXTRADATA') {
        if (dataLen == null) {
            throw new Error('Missing extra_data_len');
        }
        const dataLenN: number = +dataLen;

        if (dataOffset == null) {
            throw new Error('Missing extra_data_offset');
        }
        const dataOffsetN: number = +dataOffset;

        if (reqTx.extra_data == null) {
            throw new Error('No extra data for transaction ' + reqTx.hash);
        }

        const data: string = reqTx.extra_data;
        const substring = data.substring(dataOffsetN * 2, (dataOffsetN + dataLenN) * 2);
        return {extra_data: substring};
    }
    if (requestType === 'TXMETA') {
        const outputCount = reqTx.bin_outputs.length;
        const data: ?string = reqTx.extra_data;
        if (data != null && data.length !== 0) {
            const data_: string = data;
            return {
                version: reqTx.version,
                lock_time: reqTx.lock_time,
                inputs_cnt: reqTx.inputs.length,
                outputs_cnt: outputCount,
                extra_data_len: data_.length / 2,
            };
        } else {
            return {
                version: reqTx.version,
                lock_time: reqTx.lock_time,
                inputs_cnt: reqTx.inputs.length,
                outputs_cnt: outputCount,
            };
        }
    }
    throw new Error(`Unknown request type: ${requestType}`);
};

const requestSignedTxInfo = (inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    requestType: string,
    requestIndex: string | number
): SignTxInfoToTrezor => {
    const i = +requestIndex;
    if (requestType === 'TXINPUT') {
        return {inputs: [inputs[i]]};
    }
    if (requestType === 'TXOUTPUT') {
        return {outputs: [outputs[i]]};
    }
    if (requestType === 'TXMETA') {
        throw new Error('Cannot read TXMETA from signed transaction');
    }
    if (requestType === 'TXEXTRADATA') {
        throw new Error('Cannot read TXEXTRADATA from signed transaction');
    }
    throw new Error(`Unknown request type: ${requestType}`);
};

// requests information about a transaction
// can be either signed transaction iteslf of prev transaction
const requestTxInfo = (m: TxRequest,
    index: {[hash: string]: RefTransaction},
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>
): SignTxInfoToTrezor => {
    const md = m.details;
    const hash = md.tx_hash;
    if (hash) {
        const reqTx = index[hash.toLowerCase()];
        if (!reqTx) {
            throw new Error(`Requested unknown tx: ${hash}`);
        }
        return requestPrevTxInfo(
            reqTx,
            m.request_type,
            md.request_index,
            md.extra_data_len,
            md.extra_data_offset
        );
    } else {
        return requestSignedTxInfo(inputs, outputs, m.request_type, md.request_index);
    }
};

const saveTxSignatures = (ms: TxRequestSerialized,
    serializedTx: {serialized: string},
    signatures: Array<string>
) => {
    if (ms) {
        const _signatureIndex = ms.signature_index;
        const _signature = ms.signature;
        const _serializedTx = ms.serialized_tx;
        if (_serializedTx != null) {
            serializedTx.serialized += _serializedTx;
        }
        if (_signatureIndex != null) {
            if (_signature == null) {
                throw new Error('Unexpected null in trezor:TxRequestSerialized signature.');
            }
            signatures[_signatureIndex] = _signature;
        }
    }
};

const processTxRequest = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    m: TxRequest,
    serializedTx: {serialized: string},
    signatures: Array<string>,
    index: {[key: string]: RefTransaction},
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>
): Promise<SignedTx> => {
    saveTxSignatures(m.serialized, serializedTx, signatures);

    if (m.request_type === 'TXFINISHED') {
        return Promise.resolve({
            signatures: signatures,
            serializedTx: serializedTx.serialized,
        });
    }

    const resTx: SignTxInfoToTrezor = requestTxInfo(m, index, inputs, outputs);

    const response: DefaultMessageResponse = await typedCall('TxAck', 'TxRequest', { tx: resTx });
    return await processTxRequest(
        typedCall,
        response.message,
        serializedTx,
        signatures,
        index,
        inputs,
        outputs
    );
};

export const signTx = async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    refTxs: Array<RefTransaction>,
    coinInfo: CoinInfo,
    locktime: ?number,
): Promise<SignedTx> => {
    // TODO rbf
    // const sequence: number = locktime ? (0xffffffff - 1) : 0xffffffff;
    const index: {[key: string]: RefTransaction} = {};
    refTxs.forEach((tx: RefTransaction) => {
        index[tx.hash.toLowerCase()] = tx;
    });
    const signatures: Array<string> = [];
    const serializedTx: {serialized: string} = {serialized: ''};

    const response: DefaultMessageResponse = await typedCall('SignTx', 'TxRequest', {
        inputs_count: inputs.length,
        outputs_count: outputs.length,
        coin_name: coinInfo.name,
        lock_time: locktime,
    });

    const signed: SignedTx = await processTxRequest(
        typedCall,
        response.message,
        serializedTx,
        signatures,
        index,
        inputs,
        outputs
    );

    // TODO: validate tx
    // verifyTx(inputs, outputs, null, signed, coinInfo);

    return signed;
};
