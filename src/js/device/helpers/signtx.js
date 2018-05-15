/* @flow */
'use strict';

import * as trezor from 'flowtype/trezor';
import * as bitcoin from 'bitcoinjs-lib-zcash';
import type { MessageResponse, DefaultMessageResponse } from '../DeviceCommands';
import type { Input, Output } from '../../tx/TransactionComposer';

import type { BuildTxResult } from 'hd-wallet';
import type { CoinInfo } from '../../backend/CoinInfo';

import { reverseBuffer } from '../../utils/bufferUtils';
import { derivePubKeyHash } from '../../utils/hdnode';

function indexTxsForSign(
    txs: Array<bitcoin.Transaction>
): {[hash: string]: trezor.RefTransaction} {
    const index = {};
    txs.forEach((tx: bitcoin.Transaction) => {
        // TODO DO i need it here?
        const transformedTx = transformResTx(tx);
        index[transformedTx.hash.toLowerCase()] = transformedTx;
    });
    return index;
}

// requests information about a transaction
// can be either signed transaction iteslf of prev transaction
function requestTxInfo(
    m: trezor.TxRequest,
    index: {[hash: string]: trezor.RefTransaction},
    inputs: Array<trezor.TransactionInput>,
    outputs: Array<trezor.TransactionOutput>
): trezor.SignTxInfoToTrezor {
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
}

function requestPrevTxInfo(
    reqTx: trezor.RefTransaction,
    requestType: string,
    requestIndex: string | number,
    dataLen: ?(string | number),
    dataOffset: ?(string | number),
): trezor.SignTxInfoToTrezor {
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
}

function requestSignedTxInfo(
    inputs: Array<trezor.TransactionInput>,
    outputs: Array<trezor.TransactionOutput>,
    requestType: string,
    requestIndex: string | number
): trezor.SignTxInfoToTrezor {
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
}

function saveTxSignatures(
    ms: trezor.TxRequestSerialized,
    serializedTx: {serialized: string},
    signatures: Array<string>
) {
    if (ms) {
        const _signatureIndex = ms.signature_index;
        const _signature = ms.signature;
        const _serializedTx = ms.serialized_tx;
        if (_serializedTx != null) {
            serializedTx.serialized += _serializedTx;
        }
        if (_signatureIndex != null) {
            if (_signature == null) {
                throw new Error('Unexpected null in trezor.TxRequestSerialized signature.');
            }
            signatures[_signatureIndex] = _signature;
        }
    }
}

const processTxRequest = async (
    typedCall: (type: string, resType: string, msg: Object) => Promise<DefaultMessageResponse>,
    m: trezor.TxRequest,
    serializedTx: {serialized: string},
    signatures: Array<string>,
    index: {[key: string]: trezor.RefTransaction},
    inputs: Array<trezor.TransactionInput>,
    outputs: Array<trezor.TransactionOutput>
): Promise<MessageResponse<trezor.SignedTx>> => {
    saveTxSignatures(m.serialized, serializedTx, signatures);

    if (m.request_type === 'TXFINISHED') {
        return Promise.resolve({
            message: {
                serialized: {
                    signatures: signatures,
                    serialized_tx: serializedTx.serialized,
                },
            },
            type: 'trezor.SignedTx',
        });
    }

    const resTx: trezor.SignTxInfoToTrezor = requestTxInfo(m, index, inputs, outputs);

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
    tx: BuildTxResult,
    refTxs: Array<bitcoin.Transaction>,
    coinInfo: CoinInfo,
    locktime: ?number,
): Promise<MessageResponse<trezor.SignedTx>> => {

    // TODO rbf
    const sequence: number = locktime ? (0xffffffff - 1) : 0xffffffff;

    // format hd-wallet formats into trezor formats
    // $FlowIssue
    const inputs: Array<trezor.TransactionInput> = tx.transaction.inputs.map(i => input2trezor(i, sequence));
    // $FlowIssue
    const outputs: Array<trezor.TransactionOutput> = tx.transaction.outputs.sorted.map(o => output2trezor(o, coinInfo.network));

    const index: {[key: string]: trezor.RefTransaction} = indexTxsForSign(refTxs);
    const signatures: Array<string> = [];
    const serializedTx: {serialized: string} = {serialized: ''};

    const response: DefaultMessageResponse = await typedCall('SignTx', 'TxRequest', {
        inputs_count: inputs.length,
        outputs_count: outputs.length,
        coin_name: coinInfo.name,
        lock_time: locktime,
    });

    return await processTxRequest(
        typedCall,
        response.message,
        serializedTx,
        signatures,
        index,
        inputs,
        outputs
    );

    // TODO: validate tx
    // verifyTx(tx,)
};

// utils

const input2trezor = (input: Input, sequence: number): trezor.TransactionInput => {
    const {hash, index, path, amount} = input;
    return {
        prev_index: index,
        prev_hash: reverseBuffer(hash).toString('hex'),
        address_n: path,
        script_type: input.segwit ? 'SPENDP2SHWITNESS' : 'SPENDADDRESS',
        amount,
        sequence,
    };
};

const output2trezor = (output: Output, network: bitcoin.Network): trezor.TransactionOutput => {
    // $FlowIssue
    const amount: number = output.value;

    if (output.opReturnData instanceof Buffer) {
        return {
            amount: 0,
            op_return_data: output.opReturnData.toString('hex'),
            script_type: 'PAYTOOPRETURN',
        };
    } else if (Array.isArray(output.path) && output.value) {
        const pathArr: Array<number> = _flow_makeArray(output.path);

        return {
            address_n: pathArr,
            amount,
            script_type: output.segwit ? 'PAYTOP2SHWITNESS' : 'PAYTOADDRESS',
        };
    } else if (typeof output.address === 'string') {
        const address: string = output.address;
        isScriptHash(address, network);
        return {
            address,
            amount,
            script_type: 'PAYTOADDRESS',
        };
    } else {
        throw new Error('Invalid output format');
    }
};

function verifyTx(
    tx: BuildTxResult,
    nodes: Array<bitcoin.HDNode>,
    signedTx: MessageResponse<trezor.SignedTx>,
    coinInfo: CoinInfo,
) {
    const bitcoinTx: bitcoin.Transaction = bitcoin.Transaction.fromHex(signedTx.message.serialized.serialized_tx, coinInfo.zcash);
    // $FlowIssue
    if (tx.transaction.inputs.length !== bitcoinTx.ins.length) {
        throw new Error('Signed transaction has wrong length.');
    }
    // $FlowIssue
    if (tx.transaction.outputs.sorted.length !== bitcoinTx.outs.length) {
        throw new Error('Signed transaction has wrong length.');
    }

    tx.transaction.outputs.sorted.map((output, i) => {
        const scriptB = bitcoinTx.outs[i].script;

        if (output.opReturnData !== null) {
            // $FlowIssue
            const scriptA = bitcoin.script.nullData.output.encode(output.opReturnData);
            if (scriptA.compare(scriptB) !== 0) {
                throw new Error('Scripts differ');
            }
        } else {
            if (output.value !== bitcoinTx.outs[i].value) {
                throw new Error('Signed transaction has wrong output value.');
            }
            if (output.address == null && output.path == null) {
                throw new Error('Both path and address cannot be null.');
            }

            const addressOrPath: string | Array<number> = _flow_getPathOrAddress(output);
            const segwit: boolean = _flow_getSegwit(output);
            const scriptA = deriveOutputScript(addressOrPath, nodes, coinInfo.network, segwit);
            if (scriptA.compare(scriptB) !== 0) {
                throw new Error('Scripts differ');
            }
        }
    });
}

function isScriptHash(address: string, network: bitcoin.Network): boolean {
    const decoded = bitcoin.address.fromBase58Check(address);
    if (decoded.version === network.pubKeyHash) {
        return true;
    }
    if (decoded.version === network.scriptHash) {
        return false;
    }
    throw new Error('Unknown address type.');
}

const transformResTx = (tx: bitcoin.Transaction): trezor.RefTransaction => {
    const data = getJoinSplitData(tx);
    const dataStr = data == null ? null : data.toString('hex');
    return {
        lock_time: tx.locktime,
        version: tx.version,
        hash: tx.getId(),
        inputs: tx.ins.map((input: bitcoin.Input) => {
            return {
                prev_index: input.index,
                sequence: input.sequence,
                prev_hash: reverseBuffer(input.hash).toString('hex'),
                script_sig: input.script.toString('hex'),
            };
        }),
        bin_outputs: tx.outs.map((output: bitcoin.Output) => {
            return {
                amount: output.value,
                script_pubkey: output.script.toString('hex'),
            };
        }),
        extra_data: dataStr,
    };
};

function getJoinSplitData(transaction) {
    if (transaction.version < 2) {
        return null;
    }
    const buffer = transaction.toBuffer();
    const joinsplitByteLength = transaction.joinsplitByteLength();
    const res = buffer.slice(buffer.length - joinsplitByteLength);
    return res;
}

function deriveOutputScript(
    pathOrAddress: string | Array<number>,
    nodes: Array<bitcoin.HDNode>,
    network: bitcoin.Network,
    segwit: boolean
): Buffer {
    const scriptType = typeof pathOrAddress === 'string'
        ? (isScriptHash(pathOrAddress, network) ? 'PAYTOSCRIPTHASH' : 'PAYTOADDRESS')
        : (segwit ? 'PAYTOP2SHWITNESS' : 'PAYTOADDRESS');

    const pkh: Buffer = typeof pathOrAddress === 'string'
        ? bitcoin.address.fromBase58Check(pathOrAddress).hash
        : derivePubKeyHash(
            nodes,
            pathOrAddress[pathOrAddress.length - 2],
            pathOrAddress[pathOrAddress.length - 1]
        );

    if (scriptType === 'PAYTOADDRESS') {
        return bitcoin.script.pubKeyHash.output.encode(pkh);
    }

    if (scriptType === 'PAYTOSCRIPTHASH') {
        return bitcoin.script.scriptHash.output.encode(pkh);
    }

    if (scriptType === 'PAYTOP2SHWITNESS') {
        return deriveWitnessOutput(pkh);
    }

    throw new Error('Unknown script type ' + scriptType);
}

function deriveWitnessOutput(pkh): Buffer {
    // see https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
    // address derivation + test vectors
    const scriptSig = new Buffer(pkh.length + 2);
    scriptSig[0] = 0;
    scriptSig[1] = 0x14;
    pkh.copy(scriptSig, 2);
    const addressBytes = bitcoin.crypto.hash160(scriptSig);
    const scriptPubKey: Buffer = new Buffer(23);
    scriptPubKey[0] = 0xa9;
    scriptPubKey[1] = 0x14;
    scriptPubKey[22] = 0x87;
    addressBytes.copy(scriptPubKey, 2);
    return scriptPubKey;
}

function _flow_makeArray(a: mixed): Array<number> {
    if (!(Array.isArray(a))) {
        throw new Error('Both address and path of an output cannot be null.');
    }
    const res: Array<number> = [];
    a.forEach(k => {
        if (typeof k === 'number') {
            res.push(k);
        }
    });
    return res;
}

function _flow_getPathOrAddress(output: Output): string | Array<number> {
    if (output.path) {
        const path = output.path;
        return _flow_makeArray(path);
    }
    if (typeof output.address === 'string') {
        return output.address;
    }
    throw new Error('Wrong output type.');
}

function _flow_getSegwit(output: Output): boolean {
    if (output.segwit) {
        return true;
    }
    return false;
}
