/* @flow */

import {
    HDNode,
    crypto as BitcoinJsCrypto,
    script as BitcoinJsScript,
    Transaction as BitcoinJsTransaction,
} from '@trezor/utxo-lib';
import { getAddressScriptType, getAddressHash } from '../../../utils/addressUtils';
import { getOutputScriptType } from '../../../utils/pathUtils';

import type { BitcoinNetworkInfo } from '../../../types';

import type {
    TransactionInput,
    TransactionOutput,
    HDNodeResponse,
} from '../../../types/trezor';

type GetHDNode = (path: Array<number>, coinInfo: ?BitcoinNetworkInfo, validation?: boolean) => Promise<HDNodeResponse>;

const changePaths: Array<number> = [];

BitcoinJsTransaction.USE_STRING_VALUES = true;

export const derivePubKeyHash = async (address_n: Array<number>, getHDNode: GetHDNode, coinInfo: BitcoinNetworkInfo): Promise<Buffer> => {
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

const deriveBech32Output = (pkh: Buffer): Buffer => {
    // see https://github.com/bitcoin/bips/blob/master/bip-0173.mediawiki#Segwit_address_format
    // address derivation + test vectors
    const scriptSig = Buffer.alloc(pkh.length + 2);
    scriptSig[0] = 0;
    scriptSig[1] = 0x14;
    pkh.copy(scriptSig, 2);
    return scriptSig;
};

const deriveOutputScript = async (getHDNode: GetHDNode, output: TransactionOutput, coinInfo: BitcoinNetworkInfo): Promise<Buffer> => {
    if (output.op_return_data) {
        return BitcoinJsScript.nullData.output.encode(Buffer.from(output.op_return_data, 'hex'));
    }
    if (!output.address_n && !output.address) {
        throw new Error('deriveOutputScript: Neither address or address_n is set');
    }

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

    throw new Error('Unknown script type ' + scriptType);
};

export default async (getHDNode: GetHDNode,
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    serializedTx: string,
    coinInfo: BitcoinNetworkInfo,
): Promise<void> => {
    // clear cached values
    changePaths.splice(0, changePaths.length);

    // deserialize signed transaction
    const bitcoinTx = BitcoinJsTransaction.fromHex(serializedTx, coinInfo.network);

    // check inputs and outputs length
    if (inputs.length !== bitcoinTx.ins.length) {
        throw new Error('Signed transaction has wrong length.');
    }

    if (outputs.length !== bitcoinTx.outs.length) {
        throw new Error('Signed transaction has wrong length.');
    }

    // check outputs scripts
    for (let i = 0; i < outputs.length; i++) {
        const scriptB = bitcoinTx.outs[i].script;

        if (outputs[i].amount) {
            const amount = outputs[i].amount;
            if (amount !== bitcoinTx.outs[i].value) {
                throw new Error(`Wrong output amount at output ${i}. Requested: ${amount}, signed: ${bitcoinTx.outs[i].value}`);
            }
        }

        const scriptA = await deriveOutputScript(getHDNode, outputs[i], coinInfo);
        if (scriptA.compare(scriptB) !== 0) {
            throw new Error(`Output ${i} scripts differ.`);
        }
    }
};
