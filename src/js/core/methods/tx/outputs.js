/* @flow */
'use strict';
// npm packages
import bchaddrjs from 'bchaddrjs';
// local modules
import { getOutputScriptType } from '../../../utils/pathUtils';
import { isScriptHash, isValidAddress } from '../../../utils/addressUtils';
import { fixPath, convertMultisigPubKey, fixAmount } from './index';
import { validateParams } from '../helpers/paramsValidator';

// npm types
import type { BuildTxOutput, BuildTxOutputRequest } from 'hd-wallet';

// local types
import type { BitcoinNetworkInfo } from '../../../types';
import type { TransactionOutput } from '../../../types/trezor';

/** *****
 * SignTransaction: validation
 *******/
export const validateTrezorOutputs = (outputs: Array<TransactionOutput>, coinInfo: BitcoinNetworkInfo): Array<TransactionOutput> => {
    const trezorOutputs: Array<TransactionOutput> = outputs.map(fixPath).map(fixAmount).map(convertMultisigPubKey.bind(null, coinInfo.network));
    for (const output of trezorOutputs) {
        if (output.address_n) {
            const scriptType = getOutputScriptType(output.address_n);
            if (scriptType && output.script_type !== scriptType) throw new Error(`Output change script_type should be set to ${scriptType}`);
        } else if (typeof output.address === 'string' && !isValidAddress(output.address, coinInfo)) {
            // validate address with coin info
            throw new Error(`Invalid ${ coinInfo.label } output address ${ output.address }`);
        } else if (output.amount) {
            // TODO: parse from string
            // output.amount = parseInt(output.amount);
        }
    }
    return trezorOutputs;
};

/** *****
 * ComposeTransaction: validation
 *******/
export const validateHDOutput = (output: BuildTxOutputRequest, coinInfo: BitcoinNetworkInfo): BuildTxOutputRequest => {
    const validateAddress = (address) => {
        if (!isValidAddress(address, coinInfo)) {
            throw new Error(`Invalid ${ coinInfo.label } output address format`);
        }
    };

    switch (output.type) {
        case 'opreturn' :
            validateParams(output, [ { name: 'dataHex', type: 'string' } ]);
            return {
                type: 'opreturn',
                dataHex: output.dataHex || '',
            };

        case 'send-max' :
            validateParams(output, [ { name: 'address', type: 'string', obligatory: true } ]);
            validateAddress(output.address);
            return {
                type: 'send-max',
                address: output.address,
            };

        default :
        case 'complete' :
            validateParams(output, [
                { name: 'amount', type: 'string', obligatory: true },
                { name: 'address', type: 'string', obligatory: true },
            ]);
            validateAddress(output.address);
            return {
                type: 'complete',
                address: output.address,
                amount: parseInt(output.amount),
            };
    }
};

/** *****
 * Transform from hd-wallet format to Trezor
 *******/
export const outputToTrezor = (output: BuildTxOutput, coinInfo: BitcoinNetworkInfo): TransactionOutput => {
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
        const script_type = getOutputScriptType(address_n) || 'PAYTOADDRESS';
        // $FlowIssue
        const amount: number = output.value;

        return {
            address_n,
            amount,
            script_type,
        };
    }
    const address = output.address;
    if (typeof address !== 'string') {
        throw new Error('Wrong address type.');
    }

    // $FlowIssue
    const amount: number = output.value;

    const isCashAddress: boolean = !!(coinInfo.cashAddrPrefix);

    isScriptHash(address, coinInfo);

    // make sure that cashaddr has prefix
    return {
        address: isCashAddress ? bchaddrjs.toCashAddress(address) : address,
        amount: amount,
        script_type: 'PAYTOADDRESS',
    };
};

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

