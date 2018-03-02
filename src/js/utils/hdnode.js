/* @flow */
'use strict';

import * as trezor from '../device/trezorTypes';
import * as bitcoin from 'bitcoinjs-lib-zcash';
import * as ecurve from 'ecurve';

import type { MessageResponse } from '../device/DeviceCommands';

const curve = ecurve.getCurveByName('secp256k1');

export function derivePubKeyHash(
    nodes: Array<bitcoin.HDNode>,
    nodeIx: number,
    addressIx: number
): Buffer {
    const node = nodes[nodeIx].derive(addressIx);
    const pkh: Buffer = node.getIdentifier();
    return pkh;
}

export function pubNode2bjsNode(
    node: trezor.HDPubNode,
    network: bitcoin.Network
): bitcoin.HDNode {
    const chainCode = new Buffer(node.chain_code, 'hex');
    const publicKey = new Buffer(node.public_key, 'hex');

    if (curve == null) {
        throw new Error('secp256k1 is null');
    }
    const Q = ecurve.Point.decodeFrom(curve, publicKey);
    const res = new bitcoin.HDNode(new bitcoin.ECPair(null, Q, {network: network}), chainCode);

    res.depth = +node.depth;
    res.index = +node.child_num;
    res.parentFingerprint = node.fingerprint;

    return res;
}

// stupid hack, because trezor serializes all xpubs with bitcoin magic
function convertXpub(original: string, network: bitcoin.Network) {
    if (network.bip32.public === 0x0488b21e) {
        // it's bitcoin-like => return xpub
        return original;
    } else {
        const node = bitcoin.HDNode.fromBase58(original); // use bitcoin magic

        // "hard-fix" the new network into the HDNode keypair
        node.keyPair.network = network;
        return node.toBase58();
    }
}

// converts from internal PublicKey format to bitcoin.js HDNode
// network info is necessary. throws error on wrong xpub
export function pubKey2bjsNode(
    key: MessageResponse<trezor.PublicKey>,
    network: bitcoin.Network
): bitcoin.HDNode {
    const keyNode: trezor.HDPubNode = key.message.node;
    const bjsNode: bitcoin.HDNode = pubNode2bjsNode(keyNode, network);

    const bjsXpub: string = bjsNode.toBase58();
    const keyXpub: string = convertXpub(key.message.xpub, network);

    if (bjsXpub !== keyXpub) {
        throw new Error('Invalid public key transmission detected - ' +
                    'invalid xpub check. ' +
                    'Key: ' + bjsXpub + ', ' +
                    'Received: ' + keyXpub);
    }

    return bjsNode;
}

export function checkDerivation(
    parBjsNode: bitcoin.HDNode,
    childBjsNode: bitcoin.HDNode,
    suffix: number
): void {
    const derivedChildBjsNode = parBjsNode.derive(suffix);

    const derivedXpub = derivedChildBjsNode.toBase58();
    const compXpub = childBjsNode.toBase58();

    if (derivedXpub !== compXpub) {
        throw new Error('Invalid public key transmission detected - ' +
                    'invalid child cross-check. ' +
                    'Computed derived: ' + derivedXpub + ', ' +
                    'Computed received: ' + compXpub);
    }
}
