/* @flow */
'use strict';

import * as bs58check from 'bs58check';
import type { TezosOperation } from '../../../types/tezos';
import type { TezosTransaction } from '../../../types/trezor';
import { validateParams } from './../helpers/paramsValidator';

const prefix = {
    B: new Uint8Array([1, 52]),
    tz1: new Uint8Array([6, 161, 159]),
    tz2: new Uint8Array([6, 161, 161]),
    tz3: new Uint8Array([6, 161, 164]),
    KT1: new Uint8Array([2, 90, 121]),
    edpk: new Uint8Array([13, 15, 37, 217]),
    sppk: new Uint8Array([3, 254, 226, 86]),
    p2pk: new Uint8Array([3, 178, 139, 127]),
};

const bs58checkDecode = (prefix: Uint8Array, enc: string): Uint8Array => {
    return bs58check.decode(enc).slice(prefix.length);
};

const concatArray = (first: Uint8Array, second: Uint8Array): Uint8Array => {
    const result = new Uint8Array(first.length + second.length);
    result.set(first);
    result.set(second, first.length);
    return result;
};

// convert publicKeyHash to buffer
const publicKeyHash2buffer = (publicKeyHash: string): { originated: number, hash: Uint8Array} => {
    switch (publicKeyHash.substr(0, 3)) {
        case 'tz1':
            return {
                originated: 0,
                hash: concatArray(new Uint8Array([0]), bs58checkDecode(prefix.tz1, publicKeyHash)),
            };
        case 'tz2':
            return {
                originated: 0,
                hash: concatArray(new Uint8Array([1]), bs58checkDecode(prefix.tz2, publicKeyHash)),
            };
        case 'tz3':
            return {
                originated: 0,
                hash: concatArray(new Uint8Array([2]), bs58checkDecode(prefix.tz3, publicKeyHash)),
            };
        case 'KT1':
            return {
                originated: 1,
                hash: concatArray(bs58checkDecode(prefix.KT1, publicKeyHash), new Uint8Array([0])),
            };
        default:
            throw new Error('Wrong Tezos publicKeyHash address');
    }
};

// convert publicKeyHash to buffer
const publicKey2buffer = (publicKey: string): Uint8Array => {
    switch (publicKey.substr(0, 4)) {
        case 'edpk':
            return concatArray(new Uint8Array([0]), bs58checkDecode(prefix.edpk, publicKey));
        case 'sppk':
            return concatArray(new Uint8Array([1]), bs58checkDecode(prefix.sppk, publicKey));
        case 'p2pk':
            return concatArray(new Uint8Array([2]), bs58checkDecode(prefix.p2pk, publicKey));
        default:
            throw new Error('Wrong Tezos publicKey ');
    }
};

export const createTx = (address_n: Array<number>, branch: string, operation: TezosOperation): TezosTransaction => {
    let message: TezosTransaction = {
        address_n,
        branch: bs58checkDecode(prefix.B, branch),
    };

    // reveal public key
    if (operation.reveal) {
        const reveal = operation.reveal;

        // validate reveal parameters
        validateParams(reveal, [
            { name: 'source', type: 'string', obligatory: true },
            { name: 'public_key', type: 'string', obligatory: true },
            { name: 'fee', type: 'number', obligatory: true },
            { name: 'counter', type: 'number', obligatory: true },
            { name: 'gas_limit', type: 'number', obligatory: true },
            { name: 'storage_limit', type: 'number', obligatory: true },
        ]);

        message = {
            ...message,
            reveal: {
                source: {
                    tag: publicKeyHash2buffer(reveal.source).originated,
                    hash: publicKeyHash2buffer(reveal.source).hash,
                },
                public_key: publicKey2buffer(reveal.public_key),
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
            { name: 'source', type: 'string', obligatory: true },
            { name: 'destination', type: 'string', obligatory: true },
            { name: 'amount', type: 'number', obligatory: true },
            { name: 'counter', type: 'number', obligatory: true },
            { name: 'fee', type: 'number', obligatory: true },
            { name: 'gas_limit', type: 'number', obligatory: true },
            { name: 'storage_limit', type: 'number', obligatory: true },
        ]);

        message = {
            ...message,
            transaction: {
                source: {
                    tag: publicKeyHash2buffer(transaction.source).originated,
                    hash: publicKeyHash2buffer(transaction.source).hash,
                },
                destination: {
                    tag: publicKeyHash2buffer(transaction.destination).originated,
                    hash: publicKeyHash2buffer(transaction.destination).hash,
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
            { name: 'source', type: 'string', obligatory: true },
            { name: 'manager_pubkey', type: 'string', obligatory: true },
            { name: 'delegate', type: 'string', obligatory: true },
            { name: 'balance', type: 'number', obligatory: true },
            { name: 'spendable', type: 'boolean', obligatory: true },
            { name: 'delegatable', type: 'boolean', obligatory: true },
            { name: 'fee', type: 'number', obligatory: true },
            { name: 'counter', type: 'number', obligatory: true },
            { name: 'gas_limit', type: 'number', obligatory: true },
            { name: 'storage_limit', type: 'number', obligatory: true },
        ]);

        message = {
            ...message,
            origination: {
                source: {
                    tag: publicKeyHash2buffer(origination.source).originated,
                    hash: publicKeyHash2buffer(origination.source).hash,
                },
                manager_pubkey: publicKeyHash2buffer(origination.manager_pubkey).hash,
                delegate: publicKeyHash2buffer(origination.delegate).hash,
                balance: origination.balance,
                spendable: origination.spendable,
                delegatable: origination.delegatable,
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
            { name: 'source', type: 'string', obligatory: true },
            { name: 'delegate', type: 'string', obligatory: true },
            { name: 'fee', type: 'number', obligatory: true },
            { name: 'counter', type: 'number', obligatory: true },
            { name: 'gas_limit', type: 'number', obligatory: true },
            { name: 'storage_limit', type: 'number', obligatory: true },
        ]);

        message = {
            ...message,
            delegation: {
                source: {
                    tag: publicKeyHash2buffer(delegation.source).originated,
                    hash: publicKeyHash2buffer(delegation.source).hash,
                },
                delegate: publicKeyHash2buffer(delegation.delegate).hash,
                fee: delegation.fee,
                counter: delegation.counter,
                gas_limit: delegation.gas_limit,
                storage_limit: delegation.storage_limit,
            },
        };
    }

    return message;
};
