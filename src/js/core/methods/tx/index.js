/* @flow */
'use strict';

import { xpubToHDNodeType } from '../../../utils/hdnode';
import type { Network as BitcoinJsNetwork } from 'bitcoinjs-lib-zcash';

export const fixPath = (utxo: any): any => {
    // make sure bip32 indices are unsigned
    if (utxo.address_n && Array.isArray(utxo.address_n)) {
        utxo.address_n = utxo.address_n.map((i) => i >>> 0);
    }
    return utxo;
};

// temporary solution, change it after amount will be accepted as string in protobuf
export const fixAmount = (utxo: any): any => {
    if (utxo.amount) {
        utxo.amount = parseInt(utxo.amount);
    }
    return utxo;
};

export const convertMultisigPubKey = (network: BitcoinJsNetwork, utxo: any): any => {
    if (utxo.multisig && utxo.multisig.pubkeys) {
        // convert xpubs to HDNodeTypes
        utxo.multisig.pubkeys.forEach(pk => {
            if (typeof pk.node === 'string') {
                pk.node = xpubToHDNodeType(pk.node, network);
            }
        });
    }
    return utxo;
};

// reexport
export * from './inputs';
export * from './outputs';
export * from './refTx';
