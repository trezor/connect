import * as bitcoin from 'bitcoinjs-lib-zcash';
import { HD_HARDENED } from './constants';

export const serializePath = (path) => {
    return path.map((i) => {
        let s = (i & ~HD_HARDENED).toString();
        if (i & HD_HARDENED) {
            return s + "'";
        } else {
            return s;
        }
    }).join('/');
}

export const xpubToHDNodeType = (xpub, network) => {
    let hd = bitcoin.HDNode.fromBase58(xpub, network);
    return {
        depth: hd.depth,
        child_num: hd.index,
        fingerprint: hd.parentFingerprint,
        public_key: hd.keyPair.getPublicKeyBuffer().toString('hex'),
        chain_code: hd.chainCode.toString('hex')
    };
}

export const fixPath = (o) => {
    if (o.address_n) {
        // make sure bip32 indices are unsigned
        o.address_n = o.address_n.map((i) => i >>> 0);
    }
    return o;
};

export const convertXpub = (network, o) => {
    if (o.multisig && o.multisig.pubkeys) {
        // convert xpubs to HDNodeTypes
        o.multisig.pubkeys.forEach(pk => {
            if (typeof pk.node === 'string') {
                pk.node = xpubToHDNodeType(pk.node, network);
            }
        });
    }
    return o;
};

export const getPathForIndex = (bip44purpose: number, bip44cointype: number, index: number): Array<number> => {
    return [
        (bip44purpose | HD_HARDENED) >>> 0,
        (bip44cointype | HD_HARDENED) >>> 0,
        (index | HD_HARDENED) >>> 0
    ];
}


export const validateAccountInfoDescription = (description, backend) => {

    const error = new Error('Unknown description format.');
    const coinInfo = backend.coinInfo;
    
    // no description given. let user pick account
    if (description == null) {
        return null;
    }

    if (typeof description === 'string') {
        if (!isNaN(description)) {
            // description is a string and it's also a number, representation of account index
            return getPathForIndex(coinInfo.hasSegwit ? 49 : 44, coinInfo.bip44, parseInt(description));
        } else if(description.indexOf('m/') === 0) {
            // description is a string representation of HD path
            return parseHDPath(description);
        }else {
            // description is a xpub string
            try {
                let hd = bitcoin.HDNode.fromBase58(description, coinInfo.network);
                return description;
            } catch(err) {
                throw new Error('Invalid xpub');
            }
        }
    }

    // description is HD path
    if (Array.isArray(description)) {
        return checkHDPath(description);
    }

    // description is account index
    if (typeof description === 'number') {
        return getPathForIndex(coinInfo.hasSegwit ? 49 : 44, 0, description);
    }

    // new (from v4) description format
    if (typeof description === 'object') {
        if (!isNaN(description.account_index)) {
            let coinType = description.account_type.toLowerCase();
            if (coinType === 'legacy') {
                coinType = 44;
            } else {
                coinType = coinInfo.hasSegwit ? 49 : 44;
            }
            return getPathForIndex(coinType, coinInfo.bip44, description.account_index);
        }
        throw error;
    }

    throw error;
}

function parseHDPath(string) {
    return string
        .toLowerCase()
        .split('/')
        .filter(function (p) { return p !== 'm'; })
        .map(function (p) {
            var hardened = false;
            if (p[p.length - 1] === "'") {
                hardened = true;
                p = p.substr(0, p.length - 1);
            }
            if (isNaN(p)) {
               throw new Error('Not a valid path.');
            }
            var n = parseInt(p);
            if (hardened) { // hardened index
                n = (n | HD_HARDENED) >>> 0;
            }
            return n;
        });
}

function checkHDPath(path) {
    if (path.length !== 3) {
        throw new Error('Not a valid path.');
    }
    path[0] = path[0] >>> 0;
    path[1] = path[1] >>> 0;
    path[2] = path[2] >>> 0;
    return path;
}

export const isSegwitPath = (path) => {
    return (path[0] >>> 0) === ((49 | HD_HARDENED) >>> 0);
}