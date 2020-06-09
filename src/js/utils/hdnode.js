/* @flow */
import * as bitcoin from '@trezor/utxo-lib';
import * as ecurve from 'ecurve';
import { ERRORS } from '../constants';
import type { PublicKey, HDPubNode } from '../types/trezor/protobuf';

const curve = ecurve.getCurveByName('secp256k1');

const pubNode2bjsNode = (
    node: HDPubNode,
    network: bitcoin.Network
): bitcoin.HDNode => {
    const chainCode = Buffer.from(node.chain_code, 'hex');
    const publicKey = Buffer.from(node.public_key, 'hex');

    if (curve == null) {
        throw ERRORS.TypedError('Runtime', 'pubNode2bjsNode: secp256k1 is null');
    }
    const Q = ecurve.Point.decodeFrom(curve, publicKey);
    const res = new bitcoin.HDNode(new bitcoin.ECPair(null, Q, {network: network}), chainCode);

    res.depth = +node.depth;
    res.index = +node.child_num;
    res.parentFingerprint = node.fingerprint;

    return res;
};

export const convertXpub = (xpub: string, originalNetwork: bitcoin.Network, requestedNetwork?: bitcoin.Network): string => {
    const node = bitcoin.HDNode.fromBase58(xpub, originalNetwork);
    if (requestedNetwork) {
        node.keyPair.network = requestedNetwork;
    }
    return node.toBase58();
};

// stupid hack, because older (1.7.1, 2.0.8) trezor FW serializes all xpubs with bitcoin magic
export const convertBitcoinXpub = (xpub: string, network: bitcoin.Network): string => {
    if (network.bip32.public === 0x0488b21e) {
        // it's bitcoin-like => return xpub
        return xpub;
    } else {
        const node = bitcoin.HDNode.fromBase58(xpub); // use bitcoin magic

        // "hard-fix" the new network into the HDNode keypair
        node.keyPair.network = network;
        return node.toBase58();
    }
};

// converts from internal PublicKey format to bitcoin.js HDNode
// network info is necessary. throws error on wrong xpub
const pubKey2bjsNode = (
    key: PublicKey,
    network: bitcoin.Network
): bitcoin.HDNode => {
    const keyNode: HDPubNode = key.node;
    const bjsNode: bitcoin.HDNode = pubNode2bjsNode(keyNode, network);
    const bjsXpub: string = bjsNode.toBase58();
    const keyXpub: string = convertXpub(key.xpub, network);
    if (bjsXpub !== keyXpub) {
        throw ERRORS.TypedError('Runtime', `pubKey2bjsNode: Invalid public key transmission detected. Key: ${bjsXpub}, Received: ${keyXpub}`);
    }

    return bjsNode;
};

const checkDerivation = (
    parBjsNode: bitcoin.HDNode,
    childBjsNode: bitcoin.HDNode,
    suffix: number
) => {
    const derivedChildBjsNode = parBjsNode.derive(suffix);
    const derivedXpub = derivedChildBjsNode.toBase58();
    const compXpub = childBjsNode.toBase58();

    if (derivedXpub !== compXpub) {
        throw ERRORS.TypedError('Runtime', `checkDerivation: Invalid child cross-check public key. Derived: ${derivedXpub}, Received: ${compXpub}`);
    }
};

export const xpubDerive = (xpub: PublicKey,
    childXPub: PublicKey,
    suffix: number,
    network?: bitcoin.Network,
    requestedNetwork?: bitcoin.Network
): PublicKey => {
    const resNode: bitcoin.HDNode = pubKey2bjsNode(xpub, network || bitcoin.networks.bitcoin);
    const childNode: bitcoin.HDNode = pubKey2bjsNode(childXPub, network || bitcoin.networks.bitcoin);
    checkDerivation(resNode, childNode, suffix);

    return xpub;
};

export const xpubToHDNodeType = (xpub: string, network: bitcoin.Network): HDPubNode => {
    const hd = bitcoin.HDNode.fromBase58(xpub, network);
    return {
        depth: hd.depth,
        child_num: hd.index,
        fingerprint: hd.parentFingerprint,
        public_key: hd.keyPair.getPublicKeyBuffer().toString('hex'),
        chain_code: hd.chainCode.toString('hex'),
    };
};
