/* @flow */

import {
    bip32,
    address as BitcoinJsAddress,
    payments as BitcoinJsPayments,
    Transaction as BitcoinJsTransaction,
} from '@trezor/utxo-lib';
import { ERRORS } from '../../../constants';
import { getOutputScriptType } from '../../../utils/pathUtils';

import type { BitcoinNetworkInfo, HDNodeResponse } from '../../../types';
import type { TxInputType, TxOutputType } from '../../../types/trezor/protobuf';

type GetHDNode = (
    path: number[],
    coinInfo?: BitcoinNetworkInfo,
    validation?: boolean,
) => Promise<HDNodeResponse>;

const derivePubKeyHash = async (
    address_n: number[],
    getHDNode: GetHDNode,
    coinInfo: BitcoinNetworkInfo,
) => {
    // regular bip44 output
    if (address_n.length === 5) {
        const response = await getHDNode(address_n.slice(0, 4), coinInfo);
        const node = bip32.fromBase58(response.xpub, coinInfo.network);
        const addr = node.derive(address_n[address_n.length - 1]);
        return addr.identifier;
    }
    // custom address_n
    const response = await getHDNode(address_n, coinInfo);
    const node = bip32.fromBase58(response.xpub, coinInfo.network);
    return node.identifier;
};

const deriveOutputScript = async (
    getHDNode: GetHDNode,
    output: TxOutputType,
    coinInfo: BitcoinNetworkInfo,
) => {
    // skip multisig output check, not implemented yet
    // TODO: implement it
    if (output.multisig) return;

    if (output.op_return_data) {
        return BitcoinJsPayments.embed({ data: [Buffer.from(output.op_return_data, 'hex')] })
            .output;
    }

    if (output.address) {
        return BitcoinJsAddress.toOutputScript(output.address, coinInfo.network);
    }

    if (!output.address_n) {
        throw ERRORS.TypedError(
            'Runtime',
            'deriveOutputScript: Neither address or address_n is set',
        );
    }

    const scriptType = getOutputScriptType(output.address_n);
    const pkh = await derivePubKeyHash(output.address_n, getHDNode, coinInfo);
    const payment = { hash: pkh, network: coinInfo.network };

    if (scriptType === 'PAYTOADDRESS') {
        return BitcoinJsPayments.p2pkh(payment).output;
    }

    if (scriptType === 'PAYTOSCRIPTHASH') {
        return BitcoinJsPayments.p2sh(payment).output;
    }

    if (scriptType === 'PAYTOP2SHWITNESS') {
        return BitcoinJsPayments.p2sh({
            redeem: BitcoinJsPayments.p2wpkh(payment),
        }).output;
    }

    if (scriptType === 'PAYTOWITNESS') {
        return BitcoinJsPayments.p2wpkh(payment).output;
    }

    throw ERRORS.TypedError('Runtime', `deriveOutputScript: Unknown script type ${scriptType}`);
};

export default async (
    getHDNode: GetHDNode,
    inputs: TxInputType[],
    outputs: TxOutputType[],
    serializedTx: string,
    coinInfo: BitcoinNetworkInfo,
) => {
    // deserialize signed transaction
    const bitcoinTx = BitcoinJsTransaction.fromHex(serializedTx, { network: coinInfo.network });

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
            const { amount } = outputs[i];
            if (amount !== bitcoinTx.outs[i].value) {
                throw ERRORS.TypedError(
                    'Runtime',
                    `verifyTx: Wrong output amount at output ${i}. Requested: ${amount}, signed: ${bitcoinTx.outs[i].value}`,
                );
            }
        }

        const scriptA = await deriveOutputScript(getHDNode, outputs[i], coinInfo);
        if (!scriptA || scriptA.compare(scriptB) !== 0) {
            throw ERRORS.TypedError('Runtime', `verifyTx: Output ${i} scripts differ`);
        }
    }
};
