/* @flow */
'use strict';

import { reverseBuffer } from '../../../utils/bufferUtils';
import { address as BitcoinJSAddress } from 'bitcoinjs-lib-zcash';

import type {
    BuildTxInput,
    BuildTxOutput
} from 'hd-wallet';

import type {
    TransactionInput,
    TransactionOutput,
    RefTransaction
} from 'flowtype/trezor';

import type {
    Network as BitcoinJsNetwork,
} from 'bitcoinjs-lib-zcash';


// transform from hd-wallet format to TREZOR
export const input = (input: BuildTxInput, sequence: number): TransactionInput => {
    const { hash, index, path, amount } = input;
    return {
        prev_index: index,
        prev_hash: reverseBuffer(hash).toString('hex'),
        address_n: path,
        script_type: input.segwit ? 'SPENDP2SHWITNESS' : 'SPENDADDRESS',
        amount,
        sequence,
    };
}

// transform from hd-wallet format to TREZOR
export const output = (output: BuildTxOutput, network: BitcoinJsNetwork, isCashaddress: ?boolean): TransactionOutput => {
    if (output.address == null) {
        if (output.opReturnData != null) {
            if (output.value != null) {
                throw new Error('Wrong type.');
            }

            // $FlowIssue
            const data: Buffer = output.opReturnData;
            return {
                amount: 0,
                op_return_data: data.toString('hex'),
                script_type: 'PAYTOOPRETURN',
            };
        }

        if (!output.path) {
            throw new Error('Both address and path of an output cannot be null.');
        }

        const address_n: Array<number> = _flow_makeArray(output.path);
        // $FlowIssue
        const amount: number = output.value;

        return {
            address_n,
            amount,
            script_type: output.segwit ? 'PAYTOP2SHWITNESS' : 'PAYTOADDRESS',
        };
    }
    const address = output.address;
    if (typeof address !== 'string') {
        throw new Error('Wrong type.');
    }

    // $FlowIssue
    const amount: number = output.value;

    isScriptHash(address, network, isCashaddress);

    // cashaddr hack, internally we work only with legacy addresses, but we output cashaddr
    return {
        //address: isCashaddress ? bchaddr.toCashAddress(address) : address,
        address: address,
        amount: amount,
        script_type: 'PAYTOADDRESS',
    };
}

function isBech32(address: string): boolean {
    try {
        BitcoinJSAddress.fromBech32(address);
        return true;
    } catch (e) {
        return false;
    }
}

const isScriptHash = (address: string, network: BitcoinJsNetwork, isCashaddress: ?boolean): boolean  => {
    // cashaddr hack
    // Cashaddr format (with prefix) is neither base58 nor bech32, so it would fail
    // in bitcoinjs-lib-zchash. For this reason, we use legacy format here
    // try {
    //     if (isCashaddress) {
    //         address = bchaddr.toLegacyAddress(address);
    //     }
    // } catch (err) {
    //     throw new Error('Received cashaddr address could not be translated to legacy format for purpose of internal checks');
    // }
    if (!isBech32(address)) {
        const decoded = BitcoinJSAddress.fromBase58Check(address);
        if (decoded.version === network.pubKeyHash) {
            return false;
        }
        if (decoded.version === network.scriptHash) {
            return true;
        }
    } else {
        const decoded = BitcoinJSAddress.fromBech32(address);
        if (decoded.data.length === 20) {
            return false;
        }
        if (decoded.data.length === 32) {
            return true;
        }
    }
    throw new Error('Unknown address type.');
}

function _flow_makeArray(a: mixed): Array<number> {
    if (!Array.isArray(a)) {
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
