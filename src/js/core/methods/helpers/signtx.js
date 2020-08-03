/* @flow */
import { ERRORS } from '../../../constants';
import type { DefaultMessageResponse } from '../../../device/DeviceCommands';
import type { BitcoinNetworkInfo } from '../../../types';

import type {
    TxRequest,
    RefTransaction,
    TransactionInput,
    TransactionOutput,
    TransactionOptions,
    SignTxInfoToTrezor,
    TxRequestSerialized,
    SignedTx,
} from '../../../types/trezor/protobuf';

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
            throw ERRORS.TypedError('Runtime', 'requestPrevTxInfo: Missing extra_data_len');
        }
        const dataLenN: number = +dataLen;

        if (dataOffset == null) {
            throw ERRORS.TypedError('Runtime', 'requestPrevTxInfo: Missing extra_data_offset');
        }
        const dataOffsetN: number = +dataOffset;

        if (reqTx.extra_data == null) {
            throw ERRORS.TypedError('Runtime', 'requestPrevTxInfo: No extra data for transaction ' + reqTx.hash);
        }

        const data = reqTx.extra_data;
        const extra_data = data.substring(dataOffsetN * 2, (dataOffsetN + dataLenN) * 2);
        return { extra_data };
    }
    if (requestType === 'TXMETA') {
        const outputCount = reqTx.bin_outputs.length;
        const data: ?string = reqTx.extra_data;
        const meta: SignTxInfoToTrezor = {
            version: reqTx.version,
            lock_time: reqTx.lock_time,
            inputs_cnt: reqTx.inputs.length,
            outputs_cnt: outputCount,
            timestamp: reqTx.timestamp,
            version_group_id: reqTx.version_group_id,
            expiry: reqTx.expiry,
            branch_id: reqTx.branch_id,
        };

        if (typeof data === 'string' && data.length !== 0) {
            return {
                ...meta,
                extra_data_len: data.length / 2,
            };
        }

        return meta;
    }
    throw ERRORS.TypedError('Runtime', `requestPrevTxInfo: Unknown request type: ${requestType}`);
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
        throw ERRORS.TypedError('Runtime', 'requestSignedTxInfo: Cannot read TXMETA from signed transaction');
    }
    if (requestType === 'TXEXTRADATA') {
        throw ERRORS.TypedError('Runtime', 'requestSignedTxInfo: Cannot read TXEXTRADATA from signed transaction');
    }
    throw ERRORS.TypedError('Runtime', `requestSignedTxInfo: Unknown request type: ${requestType}`);
};

// requests information about a transaction
// can be either signed transaction itself of prev transaction
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
            throw ERRORS.TypedError('Runtime', `requestTxInfo: Requested unknown tx: ${hash}`);
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
                throw ERRORS.TypedError('Runtime', 'saveTxSignatures: Unexpected null in trezor:TxRequestSerialized signature.');
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

export default async (typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    refTxs: Array<RefTransaction>,
    options: TransactionOptions,
    coinInfo: BitcoinNetworkInfo,
): Promise<SignedTx> => {
    const index: {[key: string]: RefTransaction} = {};
    refTxs.forEach((tx: RefTransaction) => {
        index[tx.hash.toLowerCase()] = tx;
    });
    const signatures: Array<string> = [];
    const serializedTx: {serialized: string} = {serialized: ''};

    const response: DefaultMessageResponse = await typedCall('SignTx', 'TxRequest', {
        ...options,
        inputs_count: inputs.length,
        outputs_count: outputs.length,
        coin_name: coinInfo.name,
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

    return signed;
};
