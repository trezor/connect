/* @flow */
'use strict';

import * as bitcoin from 'bitcoinjs-lib-zcash';
import { reverseBuffer } from '../../../utils/bufferUtils';
import { derivePubKeyHash } from '../../../utils/hdnode';

import type {
    BuildTxResult,
    BuildTxInput,
    BuildTxOutput
} from 'hd-wallet';

import type {
    CoinInfo
} from 'flowtype';

import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction,
    SignedTx
} from '../../../types/trezor';

export const verifyTx = (tx: ?BuildTxResult,
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    nodes: ?Array<bitcoin.HDNode>,
    signedTx: SignedTx,
    coinInfo: CoinInfo,
): void => {
    const bitcoinTx: bitcoin.Transaction = bitcoin.Transaction.fromHex(signedTx.serialized, coinInfo.zcash);
    // $FlowIssue
    // if (tx.transaction.inputs.length !== bitcoinTx.ins.length) {
    //     throw new Error('Signed transaction has wrong length.');
    // }
    // // $FlowIssue
    // if (tx.transaction.outputs.sorted.length !== bitcoinTx.outs.length) {
    //     throw new Error('Signed transaction has wrong length.');
    // }



    // outputs.sorted.map((output, i) => {
    outputs.map((output, i) => {

        const scriptB = bitcoinTx.outs[i].script;

        // if (output.opReturnData !== null) {
        //     // $FlowIssue
        //     const scriptA = bitcoin.script.nullData.output.encode(output.opReturnData);
        //     if (scriptA.compare(scriptB) !== 0) {
        //         throw new Error('Scripts differ');
        //     }
        // } else {
        //     if (output.value !== bitcoinTx.outs[i].value) {
        //         throw new Error('Signed transaction has wrong output value.');
        //     }
        //     if (output.address == null && output.path == null) {
        //         throw new Error('Both path and address cannot be null.');
        //     }

        //     const addressOrPath: string | Array<number> = _flow_getPathOrAddress(output);
        //     const segwit: boolean = _flow_getSegwit(output);
        //     const scriptA = deriveOutputScript(addressOrPath, nodes, coinInfo.network, segwit);
        //     if (scriptA.compare(scriptB) !== 0) {
        //         throw new Error('Scripts differ');
        //     }
        // }
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

const transformResTx = (tx: bitcoin.Transaction): RefTransaction => {
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

function _flow_getPathOrAddress(output: BuildTxOutput): string | Array<number> {
    if (output.path) {
        const path = output.path;
        return _flow_makeArray(path);
    }
    if (typeof output.address === 'string') {
        return output.address;
    }
    throw new Error('Wrong output type.');
}

function _flow_getSegwit(output: BuildTxOutput): boolean {
    if (output.segwit) {
        return true;
    }
    return false;
}
