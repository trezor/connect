/* @flow */

import {
    HDNode,
    crypto as BitcoinJsCrypto,
    script as BitcoinJsScript,
    Transaction as BitcoinJsTransaction,
} from '@trezor/utxo-lib';
import { ERRORS } from '../../../constants';
import { getAddressScriptType, getAddressHash } from '../../../utils/addressUtils';
import { getOutputScriptType } from '../../../utils/pathUtils';

import type { BitcoinNetworkInfo } from '../../../types';

import type {
    TransactionInput,
    TransactionOutput,
    HDNodeResponse,
} from '../../../types/trezor/protobuf';

type GetHDNode = (path: Array<number>, coinInfo: ?BitcoinNetworkInfo, validation?: boolean) => Promise<HDNodeResponse>;

BitcoinJsTransaction.USE_STRING_VALUES = true;

const derivePubKeyHash = async (address_n: Array<number>, getHDNode: GetHDNode, coinInfo: BitcoinNetworkInfo): Promise<Buffer> => {
    // regular bip44 output
    if (address_n.length === 5) {
        const response = await getHDNode(address_n.slice(0, 4), coinInfo);
        const node = HDNode.fromBase58(response.xpub, coinInfo.network, true);
        const addr = node.derive(address_n[address_n.length - 1]);
        return addr.getIdentifier();
    }
    // custom address_n
    const response = await getHDNode(address_n, coinInfo);
    const node = HDNode.fromBase58(response.xpub, coinInfo.network, true);
    return node.getIdentifier();
};

const deriveWitnessOutput = (pkh: Buffer): Buffer => {
    // see https://github.com/bitcoin/bips/blob/master/bip-0049.mediawiki
    // address derivation + test vectors
    const scriptSig = Buffer.alloc(pkh.length + 2);
    scriptSig[0] = 0;
    scriptSig[1] = 0x14;
    pkh.copy(scriptSig, 2);
    const addressBytes = BitcoinJsCrypto.hash160(scriptSig);
    const scriptPubKey = Buffer.alloc(23);
    scriptPubKey[0] = 0xa9;
    scriptPubKey[1] = 0x14;
    scriptPubKey[22] = 0x87;
    addressBytes.copy(scriptPubKey, 2);
    return scriptPubKey;
};

const deriveBech32Output = (program: Buffer): Buffer => {
    // see https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#Segwit_address_format
    // address derivation + test vectors
    // ideally we would also have program version with this, but
    // currently it's fixed to version 0.
    if (program.length !== 32 && program.length !== 20) {
        throw ERRORS.TypedError('Runtime', 'deriveBech32Output: Unknown size for witness program v0');
    }

    const scriptSig = Buffer.alloc(program.length + 2);
    scriptSig[0] = 0;
    scriptSig[1] = program.length;
    program.copy(scriptSig, 2);
    return scriptSig;
};

const deriveOutputScript = async (getHDNode: GetHDNode, output: TransactionOutput, coinInfo: BitcoinNetworkInfo): Promise<Buffer | void> => {
    if (output.op_return_data) {
        return BitcoinJsScript.nullData.output.encode(Buffer.from(output.op_return_data, 'hex'));
    }
    if (!output.address_n && !output.address) {
        throw ERRORS.TypedError('Runtime', 'deriveOutputScript: Neither address or address_n is set');
    }

    // skip multisig output check, not implemented yet
    // TODO: implement it
    if (output.multisig) return;

    const scriptType = output.address_n
        ? getOutputScriptType(output.address_n)
        : getAddressScriptType(output.address, coinInfo);

    const pkh = output.address_n
        ? await derivePubKeyHash(output.address_n, getHDNode, coinInfo)
        : getAddressHash(output.address);

    if (scriptType === 'PAYTOADDRESS') {
        return BitcoinJsScript.pubKeyHash.output.encode(pkh);
    }

    if (scriptType === 'PAYTOSCRIPTHASH') {
        return BitcoinJsScript.scriptHash.output.encode(pkh);
    }

    if (scriptType === 'PAYTOP2SHWITNESS') {
        return deriveWitnessOutput(pkh);
    }

    if (scriptType === 'PAYTOWITNESS') {
        return deriveBech32Output(pkh);
    }

    throw ERRORS.TypedError('Runtime', 'deriveOutputScript: Unknown script type ' + scriptType);
};

export default async (getHDNode: GetHDNode,
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    serializedTx: string,
    coinInfo: BitcoinNetworkInfo,
): Promise<void> => {
    // deserialize signed transaction
    const bitcoinTx = BitcoinJsTransaction.fromHex(serializedTx, coinInfo.network);

    // check inputs and outputs length
    if (inputs.length !== bitcoinTx.ins.length) {
        throw ERRORS.TypedError('Runtime', 'verifyTx: Signed transaction inputs invalid length');
    }

    if (outputs.length !== bitcoinTx.outs.length) {
        throw ERRORS.TypedError('Runtime', 'verifyTx: Signed transaction outputs invalid length');
    }

    // check outputs scripts
    for (let i = 0; i < outputs.length; i++) {
        const scriptB = bitcoinTx.outs[i].script;

        if (outputs[i].amount) {
            const amount = outputs[i].amount;
            if (amount !== bitcoinTx.outs[i].value) {
                throw ERRORS.TypedError('Runtime', `verifyTx: Wrong output amount at output ${i}. Requested: ${amount}, signed: ${bitcoinTx.outs[i].value}`);
            }
        }

        const scriptA = await deriveOutputScript(getHDNode, outputs[i], coinInfo);
        if (scriptA && scriptA.compare(scriptB) !== 0) {
            throw ERRORS.TypedError('Runtime', `verifyTx: Output ${i} scripts differ`);
        }
    }
};
