/* @flow */

// local modules
import { reverseBuffer } from '../../../utils/bufferUtils';
import { validatePath, isSegwitPath, getScriptType, fixPath } from '../../../utils/pathUtils';
import { convertMultisigPubKey } from '../../../utils/hdnode';
import { validateParams } from '../helpers/paramsValidator';

// npm types
import type { BuildTxInput } from 'hd-wallet';
import type { TypedRawTransaction } from '@trezor/blockchain-link';

// local types
import type { BitcoinNetworkInfo } from '../../../types';
import type { TxInputType } from '../../../types/trezor/protobuf';

/** *****
 * SignTx: validation
 *******/
export const validateTrezorInputs = (inputs: TxInputType[], coinInfo: BitcoinNetworkInfo): TxInputType[] => {
    const trezorInputs = inputs.map(fixPath).map(convertMultisigPubKey.bind(null, coinInfo.network));
    for (const input of trezorInputs) {
        validatePath(input.address_n);
        const useAmount = isSegwitPath(input.address_n);
        // since 2.3.5 amount is obligatory for all inputs.
        // this change however is breaking 3rd party implementations
        // missing amount will be delivered by refTx object
        validateParams(input, [
            { name: 'prev_hash', type: 'string', obligatory: true },
            { name: 'prev_index', type: 'number', obligatory: true },
            { name: 'script_type', type: 'string' },
            { name: 'amount', type: 'string', obligatory: useAmount },
            { name: 'sequence', type: 'number' },
            { name: 'multisig', type: 'object' },
        ]);
    }
    return trezorInputs;
};

// this method exist as a workaround for breaking change described in validateTrezorInputs
// TODO: it could be removed after another major version release.
export const enhanceTrezorInputs = (inputs: TxInputType[], rawTxs: TypedRawTransaction[]) => {
    inputs.forEach(input => {
        if (!input.amount) {
            // eslint-disable-next-line no-console
            console.warn('TrezorConnect.singTransaction deprecation: missing input amount.');
            const refTx = rawTxs.find(t => t.tx.txid === input.prev_hash);
            if (refTx && refTx.type === 'blockbook') {
                input.amount = refTx.tx.vout[input.prev_index].value;
            }
        }
    });
};

/** *****
 * Transform from Trezor format to hd-wallet, called from SignTx to get refTxs from bitcore
 *******/
export const inputToHD = (input: TxInputType): BuildTxInput => {
    return {
        hash: reverseBuffer(Buffer.from(input.prev_hash, 'hex')),
        index: input.prev_index,
        path: input.address_n,
        amount: typeof input.amount === 'number' ? input.amount.toString() : input.amount,
        segwit: isSegwitPath(input.address_n),
    };
};

/** *****
 * Transform from hd-wallet format to Trezor
 *******/
export const inputToTrezor = (input: BuildTxInput, sequence: number): TxInputType => {
    const { hash, index, path, amount } = input;
    return {
        address_n: path,
        prev_index: index,
        prev_hash: reverseBuffer(hash).toString('hex'),
        script_type: getScriptType(path),
        // $FlowIssue: amount in BuildTxInput type (hd-wallet) is declared as optional // TODO
        amount,
        sequence,
    };
};
