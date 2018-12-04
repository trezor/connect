/* @flow */
'use strict';

import type { TezosOperation } from '../../../types/tezos';
import type { TezosTransaction } from '../../../types/trezor';
import { validateParams } from './../helpers/paramsValidator';

export const createTx = (address_n: Array<number>, branch: Array<number>, operation: TezosOperation): TezosTransaction => {
    let message: TezosTransaction = {
        address_n,
        branch,
    };

    // reveal public key
    if (operation.reveal) {
        const reveal = operation.reveal;

        // validate reveal parameters
        validateParams(reveal, [
            { name: 'source', obligatory: true },
            { name: 'fee', type: 'number', obligatory: true },
            { name: 'counter', type: 'number', obligatory: true },
            { name: 'gas_limit', type: 'number', obligatory: true },
            { name: 'storage_limit', type: 'number', obligatory: true },
            { name: 'public_key', obligatory: true },
        ]);

        // validate reveal source parameters
        validateParams(reveal.source, [
            { name: 'tag', obligatory: true },
            { name: 'hash', obligatory: true },
        ]);

        message = {
            ...message,
            reveal: {
                source: {
                    tag: reveal.source.tag,
                    hash: reveal.source.hash,
                },
                public_key: reveal.public_key,
                fee: reveal.fee,
                counter: reveal.counter,
                gas_limit: reveal.gas_limit,
                storage_limit: reveal.storage_limit,
            },
        };
    }

    // transaction
    if (operation.transaction) {
        const transaction = operation.transaction;

        // validate transaction parameters
        validateParams(transaction, [
            { name: 'source', obligatory: true },
            { name: 'destination', obligatory: true },
            { name: 'amount', type: 'number', obligatory: true },
            { name: 'counter', type: 'number', obligatory: true },
            { name: 'fee', type: 'number', obligatory: true },
            { name: 'gas_limit', type: 'number', obligatory: true },
            { name: 'storage_limit', type: 'number', obligatory: true },
        ]);

        // validate transaction source parameters
        validateParams(transaction.source, [
            { name: 'tag', obligatory: true },
            { name: 'hash', obligatory: true },
        ]);

        // validate transaction destination parameters
        validateParams(transaction.destination, [
            { name: 'tag', obligatory: true },
            { name: 'hash', obligatory: true },
        ]);

        message = {
            ...message,
            transaction: {
                destination: {
                    tag: transaction.destination.tag,
                    hash: transaction.destination.hash,
                },
                source: {
                    tag: transaction.source.tag,
                    hash: transaction.source.hash,
                },
                amount: transaction.amount,
                counter: transaction.counter,
                fee: transaction.fee,
                gas_limit: transaction.gas_limit,
                storage_limit: transaction.storage_limit,
            },
        };

        //  add parameters to transaction
        if (transaction.hasOwnProperty('parameters')) {
            message = {
                ...message,
                transaction: {
                    ...message.transaction,
                    parameters: transaction.parameters,
                },
            };
        }
    }

    // origination
    if (operation.origination) {
        const origination = operation.origination;

        // validate origination parameters
        validateParams(origination, [
            { name: 'source', obligatory: true },
            { name: 'manager_pubkey', obligatory: true },
            { name: 'balance', type: 'number', obligatory: true },
            { name: 'spendable', type: 'boolean', obligatory: true },
            { name: 'delegatable', type: 'boolean', obligatory: true },
            { name: 'delegate', obligatory: true },
            { name: 'fee', type: 'number', obligatory: true },
            { name: 'counter', obligatory: true },
            { name: 'gas_limit', type: 'number', obligatory: true },
            { name: 'storage_limit', type: 'number', obligatory: true },
        ]);

        // validate origination source parameters
        validateParams(origination.source, [
            { name: 'tag', obligatory: true },
            { name: 'hash', obligatory: true },
        ]);

        message = {
            ...message,
            origination: {
                source: {
                    tag: origination.source.tag,
                    hash: origination.source.hash,
                },
                manager_pubkey: origination.manager_pubkey,
                balance: origination.balance,
                spendable: origination.spendable,
                delegatable: origination.delegatable,
                delegate: origination.delegate,
                fee: origination.fee,
                counter: origination.counter,
                gas_limit: origination.gas_limit,
                storage_limit: origination.storage_limit,
            },
        };

        //  add script to origination
        if (origination.hasOwnProperty('script')) {
            message = {
                ...message,
                origination: {
                    ...message.origination,
                    script: origination.script,
                },
            };
        }
    }

    // delegation
    if (operation.delegation) {
        const delegation = operation.delegation;

        // validate delegation parameters
        validateParams(delegation, [
            { name: 'source', obligatory: true },
            { name: 'delegate', obligatory: true },
            { name: 'fee', type: 'number', obligatory: true },
            { name: 'counter', type: 'number', obligatory: true },
            { name: 'gas_limit', type: 'number', obligatory: true },
            { name: 'storage_limit', type: 'number', obligatory: true },
        ]);

        // validate delegation source parameters
        validateParams(delegation.source, [
            { name: 'tag', obligatory: true },
            { name: 'hash', obligatory: true },
        ]);

        message = {
            ...message,
            delegation: {
                source: {
                    tag: delegation.source.tag,
                    hash: delegation.source.hash,
                },
                delegate: delegation.delegate,
                fee: delegation.fee,
                counter: delegation.counter,
                gas_limit: delegation.gas_limit,
                storage_limit: delegation.storage_limit,
            },
        };
    }

    return message;
};
