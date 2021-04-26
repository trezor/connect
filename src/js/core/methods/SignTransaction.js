/* @flow */

import BigNumber from 'bignumber.js';
import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import { getLabel } from '../../utils/pathUtils';
import { ERRORS } from '../../constants';

import { isBackendSupported, initBlockchain } from '../../backend/BlockchainLink';
import signTx from './helpers/signtx';
import signTxLegacy from './helpers/signtx-legacy';
import verifyTx from './helpers/signtxVerify';

import {
    validateTrezorInputs,
    enhanceTrezorInputs,
    validateTrezorOutputs,
    getReferencedTransactions,
    validateReferencedTransactions,
    transformReferencedTransactions,
    getOrigTransactions,
    transformOrigTransactions,
} from './tx';

import type { RefTransaction, TransactionOptions } from '../../types/networks/bitcoin';
import type { TxInputType, TxOutputType } from '../../types/trezor/protobuf';
import type { CoreMessage, BitcoinNetworkInfo, AccountAddresses } from '../../types';

type Params = {
    inputs: TxInputType[],
    outputs: TxOutputType[],
    refTxs?: RefTransaction[],
    addresses?: AccountAddresses,
    options: TransactionOptions,
    coinInfo: BitcoinNetworkInfo,
    push: boolean,
};

export default class SignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.info = 'Sign transaction';

        const { payload } = message;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'inputs', type: 'array', obligatory: true },
            { name: 'outputs', type: 'array', obligatory: true },
            { name: 'refTxs', type: 'array', allowEmpty: true },
            { name: 'account', type: 'object' },
            { name: 'locktime', type: 'number' },
            { name: 'timestamp', type: 'number' },
            { name: 'version', type: 'number' },
            { name: 'expiry', type: 'number' },
            { name: 'overwintered', type: 'boolean' },
            { name: 'versionGroupId', type: 'number' },
            { name: 'branchId', type: 'number' },
            { name: 'push', type: 'boolean' },
        ]);

        const coinInfo = getBitcoinNetwork(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        }
        // set required firmware from coinInfo support
        this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
        this.info = getLabel('Sign #NETWORK transaction', coinInfo);

        const inputs = validateTrezorInputs(payload.inputs, coinInfo);
        const outputs = validateTrezorOutputs(payload.outputs, coinInfo);
        const refTxs = validateReferencedTransactions(payload.refTxs, inputs, outputs);

        const outputsWithAmount = outputs.filter(
            output =>
                typeof output.amount === 'string' &&
                !Object.prototype.hasOwnProperty.call(output, 'op_return_data'),
        );
        if (outputsWithAmount.length > 0) {
            const total: BigNumber = outputsWithAmount.reduce(
                (bn, output) => bn.plus(typeof output.amount === 'string' ? output.amount : '0'),
                new BigNumber(0),
            );
            if (total.lte(coinInfo.dustLimit)) {
                throw ERRORS.TypedError(
                    'Method_InvalidParameter',
                    'Total amount is below dust limit.',
                );
            }
        }

        this.params = {
            inputs,
            outputs: payload.outputs,
            refTxs,
            addresses: payload.account ? payload.account.addresses : undefined,
            options: {
                lock_time: payload.locktime,
                timestamp: payload.timestamp,
                version: payload.version,
                expiry: payload.expiry,
                overwintered: payload.overwintered,
                version_group_id: payload.versionGroupId,
                branch_id: payload.branchId,
            },
            coinInfo,
            push: typeof payload.push === 'boolean' ? payload.push : false,
        };

        if (coinInfo.hasTimestamp && !Object.prototype.hasOwnProperty.call(payload, 'timestamp')) {
            const d = new Date();
            this.params.options.timestamp = Math.round(d.getTime() / 1000);
        }
    }

    async run() {
        const { device, params } = this;

        let refTxs: RefTransaction[] = [];
        const useLegacySignProcess = device.unavailableCapabilities.replaceTransaction;
        if (!params.refTxs) {
            // initialize backend
            const refTxsIds = getReferencedTransactions(params.inputs);
            if (refTxsIds.length > 0) {
                // validate backend
                isBackendSupported(params.coinInfo);
                const blockchain = await initBlockchain(params.coinInfo, this.postMessage);
                const rawTxs = await blockchain.getTransactions(refTxsIds);
                enhanceTrezorInputs(this.params.inputs, rawTxs);
                refTxs = transformReferencedTransactions(rawTxs, params.coinInfo);

                const origTxsIds = getOrigTransactions(params.inputs, params.outputs);
                if (!useLegacySignProcess && origTxsIds.length > 0) {
                    const rawOrigTxs = await blockchain.getTransactions(origTxsIds);
                    let { addresses } = params;
                    // sender account addresses not provided
                    // fetch account info from the blockbook
                    if (!addresses) {
                        // TODO: validate inputs address_n's === same account
                        const node = await device
                            .getCommands()
                            .getHDNode(params.inputs[0].address_n.slice(0, 3), params.coinInfo);
                        const account = await blockchain.getAccountInfo({
                            descriptor: node.xpubSegwit || node.xpub,
                            coin: params.coinInfo.name,
                            details: 'tokens',
                        });
                        addresses = account.addresses;
                    }
                    const origRefTxs = transformOrigTransactions(
                        rawOrigTxs,
                        params.coinInfo,
                        addresses,
                    );
                    refTxs = refTxs.concat(origRefTxs);
                }
            }
        } else {
            refTxs = params.refTxs;
        }

        const signTxMethod = !useLegacySignProcess ? signTx : signTxLegacy;
        const response = await signTxMethod(
            device.getCommands().typedCall.bind(device.getCommands()),
            params.inputs,
            params.outputs,
            refTxs,
            params.options,
            params.coinInfo,
        );

        await verifyTx(
            device.getCommands().getHDNode.bind(device.getCommands()),
            params.inputs,
            params.outputs,
            response.serializedTx,
            params.coinInfo,
        );

        if (params.push) {
            // validate backend
            isBackendSupported(params.coinInfo);
            const blockchain = await initBlockchain(params.coinInfo, this.postMessage);
            const txid = await blockchain.pushTransaction(response.serializedTx);
            return {
                ...response,
                txid,
            };
        }

        return response;
    }
}
