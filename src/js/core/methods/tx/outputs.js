/* @flow */
'use strict';
// npm packages
import bchaddrjs from 'bchaddrjs';
// local modules
import { isSegwitPath } from '../../../utils/pathUtils';
import { isScriptHash, isValidAddress } from '../../../utils/addressUtils';
import { fixPath, convertMultisigPubKey, fixAmount } from './index';
import { validateParams } from '../helpers/paramsValidator';

// npm types
import type { BuildTxOutput, BuildTxOutputRequest } from 'hd-wallet';

// local types
import type { CoinInfo } from 'flowtype';
import type { TransactionOutput } from '../../../types/trezor';

/** *****
 * SignTransaction: validation
 *******/
export const validateTrezorOutputs = (outputs: Array<TransactionOutput>, coinInfo: CoinInfo): Array<TransactionOutput> => {
    const trezorOutputs: Array<TransactionOutput> = outputs.map(fixPath).map(fixAmount).map(convertMultisigPubKey.bind(null, coinInfo.network));
    for (const output of trezorOutputs) {
        if (output.address_n && isSegwitPath(output.address_n)) {
            if (output.script_type !== 'PAYTOP2SHWITNESS') throw new Error('Output change script_type should be set to PAYTOP2SHWITNESS');
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
export const validateHDOutput = (output: BuildTxOutputRequest, coinInfo: CoinInfo): BuildTxOutputRequest => {
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
export const outputToTrezor = (output: BuildTxOutput, coinInfo: CoinInfo): TransactionOutput => {
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
        throw new Error('Wrong address type.');
    }

    // $FlowIssue
    const amount: number = output.value;

    const isCashAddress: boolean = !!(coinInfo.cashAddrPrefix);

    isScriptHash(address, coinInfo);

    // make sure that cashaddr has prefix
    return {
        address: isCashAddress ? bchaddrjs.toCashAddress(address) : address,
        // address: address,
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

