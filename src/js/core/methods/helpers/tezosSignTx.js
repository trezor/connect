/* @flow */
'use strict';

import type { TezosCurve, TezosOperation } from '../../../types/tezos';
import type { TezosTransaction } from '../../../types/trezor';
import { validateParams } from './../helpers/paramsValidator';

export const createTx = (address_n: Array<number>, curve: TezosCurve, branch: Array<number>, operation: TezosOperation): TezosTransaction => {

    let message: TezosTransaction = {
        address_n,
        curve,
        branch,
    }

    // reveal public key 
    if (operation.hasOwnProperty('reveal')) {

        const reveal = operation.reveal;

        // validate reveal paramaters 
        validateParams(reveal, [
            { name: 'source', obligatory: true },
            { name: 'public_key', obligatory: true },
            { name: 'counter', obligatory: true },
            { name: 'gas_limit', obligatory: true },
            { name: 'storage_limit', obligatory: true },
        ]);

        // validate reveal source paramaters 
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
            }
        }
    }

    // transaction 
    if (operation.hasOwnProperty('transaction')) {

        const transaction = operation.transaction;

        // validate transaction paramaters 
        validateParams(transaction, [
            { name: 'source', obligatory: true },
            { name: 'destination', obligatory: true },
            { name: 'counter', obligatory: true },
            { name: 'fee', obligatory: true },
            { name: 'amount', obligatory: true },
            { name: 'gas_limit', obligatory: true },
            { name: 'storage_limit', obligatory: true },
        ]);

        // validate transaction source paramaters 
        validateParams(transaction.source, [
            { name: 'tag', obligatory: true },
            { name: 'hash', obligatory: true },
        ]);

        // validate transaction destination paramaters 
        validateParams(transaction.source, [
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
                fee: transaction.fee,
                counter: transaction.counter,
                gas_limit: transaction.gas_limit,
                storage_limit: transaction.storage_limit,
            }
        }

        //  add parameters to transaction
        if (transaction.hasOwnProperty('parameters')) {

            message = {
                ...message,
                transaction: {
                    ...message.transaction,
                    parameters: transaction.parameters,
                }
            }

        }

    }


    // origination 
    if (operation.hasOwnProperty('origination')) {

        const origination = operation.origination;

        // validate origination paramaters 
        validateParams(origination, [
            { name: 'source', obligatory: true },
            { name: 'manager_pubkey', obligatory: true },
            { name: 'balance', obligatory: true },
            { name: 'fee', obligatory: true },
            { name: 'counter', obligatory: true },
            { name: 'gas_limit', obligatory: true },
            { name: 'storage_limit', obligatory: true },
            { name: 'spendable', obligatory: true },
            { name: 'delegatable', obligatory: true },
            { name: 'delegate', obligatory: true },
        ]);

        // validate origination source paramaters 
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
                fee: origination.fee,
                counter: origination.counter,
                gas_limit: origination.gas_limit,
                storage_limit: origination.storage_limit,
                spendable: origination.spendable,
                delegatable: origination.delegatable,
                delegate: origination.delegate,
            },
        }

        //  add script to origination
        if (origination.hasOwnProperty('script')) {

            message = {
                ...message,
                origination: {
                    ...message.origination,
                    script: origination.script,
                }
            }

        }
    }


    // delegation 
    if (operation.hasOwnProperty('delegation')) {

        const delegation = operation.delegation;

        // validate delegation paramaters 
        validateParams(delegation, [
            { name: 'source', obligatory: true },
            { name: 'delegate', obligatory: true },
            { name: 'fee', obligatory: true },
            { name: 'counter', obligatory: true },
            { name: 'gas_limit', obligatory: true },
            { name: 'storage_limit', obligatory: true },
        ]);

        // validate delegation source paramaters 
        validateParams(delegation.source, [
            { name: 'tag', obligatory: true },
            { name: 'hash', obligatory: true },
        ]);

        // validate delegation delegate paramaters 
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
        }
    }

    return message
}