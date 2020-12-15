/* @flow */

import { xpubToHDNodeType } from '../../../utils/hdnode';
import type { Network } from '@trezor/utxo-lib';
import type { TxInputType, TxOutputType } from '../../../types/trezor/protobuf';

export const fixPath = <T: TxInputType | TxOutputType>(utxo: T): T => {
    // make sure bip32 indices are unsigned
    if (utxo.address_n && Array.isArray(utxo.address_n)) {
        utxo.address_n = utxo.address_n.map((i) => i >>> 0);
    }
    return utxo;
};

export const convertMultisigPubKey = <T: TxInputType | TxOutputType>(network: Network, utxo: T): T => {
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
