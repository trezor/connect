/* @flow */

// npm packages
import bchaddrjs from 'bchaddrjs';

// local modules
import { getOutputScriptType } from '../../../utils/pathUtils';
import { isScriptHash, isValidAddress } from '../../../utils/addressUtils';
import { fixPath, convertMultisigPubKey } from './index';
import { validateParams } from '../helpers/paramsValidator';
import { ERRORS } from '../../../constants';

// npm types
import type { BuildTxOutput, BuildTxOutputRequest } from 'hd-wallet';

// local types
import type { BitcoinNetworkInfo } from '../../../types';
import type { TransactionOutput } from '../../../types/trezor/protobuf';

/** *****
 * SignTransaction: validation
 *******/
export const validateTrezorOutputs = (outputs: Array<TransactionOutput>, coinInfo: BitcoinNetworkInfo): Array<TransactionOutput> => {
    const trezorOutputs: Array<TransactionOutput> = outputs.map(fixPath).map(convertMultisigPubKey.bind(null, coinInfo.network));
    for (const output of trezorOutputs) {
        validateParams(output, [
            { name: 'address_n', type: 'array' },
            { name: 'address', type: 'string' },
            { name: 'amount', type: 'string' },
            { name: 'op_return_data', type: 'string' },
            { name: 'multisig', type: 'object' },
        ]);

        if (Object.prototype.hasOwnProperty.call(output, 'address_n') && Object.prototype.hasOwnProperty.call(output, 'address')) {
            throw ERRORS.TypedError('Method_InvalidParameter', 'Cannot use address and address_n in one output');
        }

        if (output.address_n) {
            const scriptType = getOutputScriptType(output.address_n);
            if (output.script_type !== scriptType) throw ERRORS.TypedError('Method_InvalidParameter', `Output change script_type should be set to ${scriptType}`);
        }

        if (typeof output.address === 'string' && !isValidAddress(output.address, coinInfo)) {
            // validate address with coin info
            throw ERRORS.TypedError('Method_InvalidParameter', `Invalid ${ coinInfo.label } output address ${ output.address }`);
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
            throw ERRORS.TypedError('Method_InvalidParameter', `Invalid ${ coinInfo.label } output address format`);
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

        case 'noaddress' :
            validateParams(output, [
                { name: 'amount', type: 'string', obligatory: true },
            ]);
            return {
                type: 'noaddress',
                amount: output.amount,
            };

        case 'send-max-noaddress' :
            return {
                type: 'send-max-noaddress',
            };

        default :
            validateParams(output, [
                { name: 'amount', type: 'string', obligatory: true },
                { name: 'address', type: 'string', obligatory: true },
            ]);
            validateAddress(output.address);
            return {
                type: 'complete',
                address: output.address,
                amount: output.amount,
            };
    }
};

/** *****
 * Transform from hd-wallet format to Trezor
 *******/
export const outputToTrezor = (output: BuildTxOutput, coinInfo: BitcoinNetworkInfo): TransactionOutput => {
    if (output.opReturnData) {
        if (Object.prototype.hasOwnProperty.call(output, 'value')) {
            throw ERRORS.TypedError('Method_InvalidParameter', 'opReturn output should not contains value');
        }
        const data: Buffer = output.opReturnData;
        return {
            amount: '0',
            op_return_data: data.toString('hex'),
            script_type: 'PAYTOOPRETURN',
        };
    }
    if (!output.address && !output.path) {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Both address and path of an output cannot be null.');
    }
    if (output.path) {
        return {
            address_n: output.path,
            amount: output.value,
            script_type: getOutputScriptType(output.path),
        };
    }

    const { address, value } = output;
    if (typeof address !== 'string') {
        throw ERRORS.TypedError('Method_InvalidParameter', 'Wrong output address type, should be string');
    }

    const isCashAddress: boolean = !!(coinInfo.cashAddrPrefix);

    isScriptHash(address, coinInfo);

    // make sure that cashaddr has prefix
    return {
        address: isCashAddress ? bchaddrjs.toCashAddress(address) : address,
        amount: value,
        script_type: 'PAYTOADDRESS',
    };
};
