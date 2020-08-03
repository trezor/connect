/* @flow */

import BigNumber from 'bignumber.js';
import AbstractMethod from './AbstractMethod';
import { validateParams, getFirmwareRange } from './helpers/paramsValidator';
import { getBitcoinNetwork } from '../../data/CoinInfo';
import { getLabel } from '../../utils/pathUtils';
import { ERRORS } from '../../constants';

import { isBackendSupported, initBlockchain } from '../../backend/BlockchainLink';
import signTx from './helpers/signtx';
import verifyTx from './helpers/signtxVerify';

import {
    validateTrezorInputs,
    validateTrezorOutputs,
    inputToHD,
    getReferencedTransactions,
    transformReferencedTransactions,
} from './tx';

import type {
    TransactionInput,
    TransactionOutput,
    TransactionOptions,
    RefTransaction,
    SignedTx,
} from '../../types/trezor/protobuf';

import type {
    BuildTxInput,
} from 'hd-wallet';

import type { CoreMessage, BitcoinNetworkInfo } from '../../types';

type Params = {
    inputs: Array<TransactionInput>;
    outputs: Array<TransactionOutput>;
    refTxs: ?Array<RefTransaction>;
    options: TransactionOptions;
    coinInfo: BitcoinNetworkInfo;
    push: boolean;
}

export default class SignTransaction extends AbstractMethod {
    params: Params;

    constructor(message: CoreMessage) {
        super(message);
        this.requiredPermissions = ['read', 'write'];
        this.info = 'Sign transaction';

        const payload: Object = message.payload;

        // validate incoming parameters
        validateParams(payload, [
            { name: 'coin', type: 'string', obligatory: true },
            { name: 'inputs', type: 'array', obligatory: true },
            { name: 'outputs', type: 'array', obligatory: true },
            { name: 'refTxs', type: 'array', allowEmpty: true },
            { name: 'locktime', type: 'number' },
            { name: 'timestamp', type: 'number' },
            { name: 'version', type: 'number' },
            { name: 'expiry', type: 'number' },
            { name: 'overwintered', type: 'boolean' },
            { name: 'versionGroupId', type: 'number' },
            { name: 'branchId', type: 'number' },
            { name: 'push', type: 'boolean' },
        ]);

        const coinInfo: ?BitcoinNetworkInfo = getBitcoinNetwork(payload.coin);
        if (!coinInfo) {
            throw ERRORS.TypedError('Method_UnknownCoin');
        } else {
            // set required firmware from coinInfo support
            this.firmwareRange = getFirmwareRange(this.name, coinInfo, this.firmwareRange);
            this.info = getLabel('Sign #NETWORK transaction', coinInfo);
        }

        if (Object.prototype.hasOwnProperty.call(payload, 'refTxs')) {
            payload.refTxs.forEach(tx => {
                validateParams(tx, [
                    { name: 'hash', type: 'string', obligatory: true },
                    { name: 'inputs', type: 'array', obligatory: true },
                    { name: 'bin_outputs', type: 'array', obligatory: true },
                    { name: 'version', type: 'number', obligatory: true },
                    { name: 'lock_time', type: 'number', obligatory: true },
                    { name: 'extra_data', type: 'string' },
                    { name: 'timestamp', type: 'number' },
                    { name: 'version_group_id', type: 'number' },
                ]);
            });
        }

        const inputs: Array<TransactionInput> = validateTrezorInputs(payload.inputs, coinInfo);
        const outputs: Array<TransactionOutput> = validateTrezorOutputs(payload.outputs, coinInfo);

        const outputsWithAmount = outputs.filter(output => typeof output.amount === 'string' && !Object.prototype.hasOwnProperty.call(output, 'op_return_data'));
        if (outputsWithAmount.length > 0) {
            const total: BigNumber = outputsWithAmount.reduce((bn: BigNumber, output: TransactionOutput) => {
                return bn.plus(typeof output.amount === 'string' ? output.amount : '0');
            }, new BigNumber(0));
            if (total.lte(coinInfo.dustLimit)) {
                throw ERRORS.TypedError('Method_InvalidParameter', 'Total amount is below dust limit.');
            }
        }

        this.params = {
            inputs,
            outputs: payload.outputs,
            refTxs: payload.refTxs,
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

    async run(): Promise<SignedTx> {
        const { device, params } = this;

        let refTxs: Array<RefTransaction> = [];
        if (!params.refTxs) {
            // initialize backend
            const hdInputs: Array<BuildTxInput> = params.inputs.map(inputToHD);
            const refTxsIds = getReferencedTransactions(hdInputs);
            if (refTxsIds.length > 0) {
                // validate backend
                isBackendSupported(params.coinInfo);
                const blockchain = await initBlockchain(params.coinInfo, this.postMessage);
                const bjsRefTxs = await blockchain.getReferencedTransactions(refTxsIds);
                refTxs = transformReferencedTransactions(bjsRefTxs);
            }
        } else {
            refTxs = params.refTxs;
        }

        const response = await signTx(
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
