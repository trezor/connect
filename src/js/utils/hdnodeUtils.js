/* @flow */

import { bip32 } from '@trezor/utxo-lib';
import type { Network, BIP32Interface } from '@trezor/utxo-lib';
import { ERRORS } from '../constants';
import type {
    PublicKey,
    EthereumPublicKey,
    HDNodeType,
    TxInputType,
    TxOutputType,
} from '../types/trezor/protobuf';

const pubNode2bjsNode = (node: HDNodeType, network?: Network) => {
    const chainCode = Buffer.from(node.chain_code, 'hex');
    const publicKey = Buffer.from(node.public_key, 'hex');

    const res = bip32.fromPublicKey(publicKey, chainCode, network);
    // override private fields of BIP32Interface
    res.__DEPTH = node.depth;
    res.__INDEX = node.child_num;
    res.__PARENT_FINGERPRINT = node.fingerprint;

    return res;
};

export const convertXpub = (
    xpub: string,
    originalNetwork?: Network,
    requestedNetwork?: Network,
) => {
    const node = bip32.fromBase58(xpub, originalNetwork);
    if (requestedNetwork) {
        // override network of BIP32Interface
        node.network = requestedNetwork;
    }
    return node.toBase58();
};

// stupid hack, because older (1.7.1, 2.0.8) trezor FW serializes all xpubs with bitcoin magic
export const convertBitcoinXpub = (xpub: string, network: Network) => {
    if (network.bip32.public === 0x0488b21e) {
        // it's bitcoin-like => return xpub
        return xpub;
    }
    const node = bip32.fromBase58(xpub); // use default bitcoin magic

    // override network of BIP32Interface
    node.network = network;
    return node.toBase58();
};

// converts from protobuf.PublicKey to bip32.BIP32Interface
const pubKey2bjsNode = (key: PublicKey | EthereumPublicKey, network?: Network) => {
    const keyNode = key.node;
    const bjsNode = pubNode2bjsNode(keyNode, network);
    const bjsXpub = bjsNode.toBase58();
    const keyXpub = convertXpub(key.xpub, network);
    if (bjsXpub !== keyXpub) {
        throw ERRORS.TypedError(
            'Runtime',
            `pubKey2bjsNode: Invalid public key transmission detected. Key: ${bjsXpub}, Received: ${keyXpub}`,
        );
    }

    return bjsNode;
};

const checkDerivation = (
    parBjsNode: BIP32Interface,
    childBjsNode: BIP32Interface,
    suffix: number,
) => {
    const derivedChildBjsNode = parBjsNode.derive(suffix);
    const derivedXpub = derivedChildBjsNode.toBase58();
    const compXpub = childBjsNode.toBase58();

    if (derivedXpub !== compXpub) {
        throw ERRORS.TypedError(
            'Runtime',
            `checkDerivation: Invalid child cross-check public key. Derived: ${derivedXpub}, Received: ${compXpub}`,
        );
    }
};

export function xpubDerive<PK: PublicKey | EthereumPublicKey>(
    xpub: PK,
    childXPub: PK,
    suffix: number,
    network?: Network,
    _requestedNetwork?: Network,
): PK {
    const resNode = pubKey2bjsNode(xpub, network);
    const childNode = pubKey2bjsNode(childXPub, network);
    checkDerivation(resNode, childNode, suffix);

    return xpub;
}

export const xpubToHDNodeType = (xpub: string, network: Network): HDNodeType => {
    const hd = bip32.fromBase58(xpub, network);
    return {
        depth: hd.depth,
        child_num: hd.index,
        fingerprint: hd.parentFingerprint,
        public_key: hd.publicKey.toString('hex'),
        chain_code: hd.chainCode.toString('hex'),
    };
};

export const convertMultisigPubKey = <T: TxInputType | TxOutputType>(
    network: Network,
    utxo: T,
): T => {
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
