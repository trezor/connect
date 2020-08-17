/* @flow */

import { getCoinName } from '../data/CoinInfo';
import { ERRORS } from '../constants';
import type { BitcoinNetworkInfo, CoinInfo } from '../types';
import type { InputScriptType, OutputScriptType } from '../types/trezor/protobuf';

export const HD_HARDENED: number = 0x80000000;
export const toHardened = (n: number): number => (n | HD_HARDENED) >>> 0;
export const fromHardened = (n: number): number => (n & ~HD_HARDENED) >>> 0;

const PATH_NOT_VALID = ERRORS.TypedError('Method_InvalidParameter', 'Not a valid path');
const PATH_NEGATIVE_VALUES = ERRORS.TypedError('Method_InvalidParameter', 'Path cannot contain negative values');

export const getHDPath = (path: string): Array<number> => {
    const parts: Array<string> = path.toLowerCase().split('/');
    if (parts[0] !== 'm') throw PATH_NOT_VALID;
    return parts.filter((p: string) => p !== 'm' && p !== '')
        .map((p: string) => {
            let hardened: boolean = false;
            if (p.substr(p.length - 1) === "'") {
                hardened = true;
                p = p.substr(0, p.length - 1);
            }
            let n: number = parseInt(p);
            if (isNaN(n)) {
                throw PATH_NOT_VALID;
            } else if (n < 0) {
                throw PATH_NEGATIVE_VALUES;
            }
            if (hardened) { // hardened index
                n = toHardened(n);
            }
            return n;
        });
};

export const isMultisigPath = (path: ?Array<number>): boolean => {
    return Array.isArray(path) && path[0] === toHardened(48);
};

export const isSegwitPath = (path: ?Array<number>): boolean => {
    return Array.isArray(path) && path[0] === toHardened(49);
};

export const isBech32Path = (path: ?Array<number>): boolean => {
    return Array.isArray(path) && path[0] === toHardened(84);
};

export const getScriptType = (path: ?Array<number>): InputScriptType => {
    if (!Array.isArray(path) || path.length < 1) return 'SPENDADDRESS';

    const p1 = fromHardened(path[0]);
    switch (p1) {
        case 48:
            return 'SPENDMULTISIG';
        case 49:
            return 'SPENDP2SHWITNESS';
        case 84:
            return 'SPENDWITNESS';
        default:
            return 'SPENDADDRESS';
    }
};

export const getOutputScriptType = (path: ?Array<number>): OutputScriptType => {
    if (!Array.isArray(path) || path.length < 1) return 'PAYTOADDRESS';

    // compatibility for Casa - allow an unhardened 49 path to use PAYTOP2SHWITNESS
    if (path[0] === 49) {
        return 'PAYTOP2SHWITNESS';
    }

    const p = fromHardened(path[0]);
    switch (p) {
        case 48:
            return 'PAYTOMULTISIG';
        case 49:
            return 'PAYTOP2SHWITNESS';
        case 84:
            return 'PAYTOWITNESS';
        default:
            return 'PAYTOADDRESS';
    }
};

export const validatePath = (path: string | Array<number>, length: number = 0, base: boolean = false): Array<number> => {
    let valid: ?Array<number>;
    if (typeof path === 'string') {
        valid = getHDPath(path);
    } else if (Array.isArray(path)) {
        valid = path.map((p: any) => {
            const n: number = parseInt(p);
            if (isNaN(n)) {
                throw PATH_NOT_VALID;
            } else if (n < 0) {
                throw PATH_NEGATIVE_VALUES;
            }
            return n;
        });
    }
    if (!valid) throw PATH_NOT_VALID;
    if (length > 0 && valid.length < length) throw PATH_NOT_VALID;
    return base ? valid.splice(0, 3) : valid;
};

export const getSerializedPath = (path: Array<number>): string => {
    return 'm/' + path.map((i) => {
        const s = (i & ~HD_HARDENED).toString();
        if (i & HD_HARDENED) {
            return s + "'";
        } else {
            return s;
        }
    }).join('/');
};

export const getPathFromIndex = (bip44purpose: number, bip44cointype: number, index: number): Array<number> => {
    return [
        toHardened(bip44purpose),
        toHardened(bip44cointype),
        toHardened(index),
    ];
};

export const getIndexFromPath = (path: Array<number>): number => {
    if (path.length < 3) {
        throw ERRORS.TypedError('Method_InvalidParameter', `getIndexFromPath: invalid path length ${ path.toString() }`);
    }
    return fromHardened(path[2]);
};

export const getAccountLabel = (path: Array<number>, coinInfo: BitcoinNetworkInfo): string => {
    const coinLabel: string = coinInfo.label;
    const p1: number = fromHardened(path[0]);
    const account: number = fromHardened(path[2]);
    const realAccountId: number = account + 1;
    const prefix: string = 'Export info of';
    let accountType: string = '';

    if (p1 === 48) {
        accountType = `${coinLabel} multisig`;
    } else if (p1 === 44 && coinInfo.segwit) {
        accountType = `${coinLabel} legacy`;
    } else {
        accountType = coinLabel;
    }
    return `${ prefix } ${ accountType } <span>account #${realAccountId}</span>`;
};

export const getPublicKeyLabel = (path: Array<number>, coinInfo: ?BitcoinNetworkInfo): string => {
    let hasSegwit: boolean = false;
    let coinLabel: string = 'Unknown coin';
    if (coinInfo) {
        coinLabel = coinInfo.label;
        hasSegwit = coinInfo.segwit;
    } else {
        coinLabel = getCoinName(path);
    }

    const p1: number = fromHardened(path[0]);
    let account: number = path.length >= 3 ? fromHardened(path[2]) : -1;
    let realAccountId: number = account + 1;
    let prefix: string = 'Export public key';
    let accountType: string = '';

    // Copay id
    if (p1 === 45342) {
        const p2: number = fromHardened(path[1]);
        account = fromHardened(path[3]);
        realAccountId = account + 1;
        prefix = 'Export Copay ID of';
        if (p2 === 48) {
            accountType = 'multisig';
        } else if (p2 === 44) {
            accountType = 'legacy';
        }
    } else if (p1 === 48) {
        accountType = `${coinLabel} multisig`;
    } else if (p1 === 44 && hasSegwit) {
        accountType = `${coinLabel} legacy`;
    } else if (p1 === 84 && hasSegwit) {
        accountType = `${coinLabel} native segwit`;
    } else {
        accountType = coinLabel;
    }

    if (realAccountId > 0) {
        return `${ prefix } of ${ accountType } <span>account #${realAccountId}</span>`;
    } else {
        return prefix;
    }
};

export const getLabel = (label: string, coinInfo: ?CoinInfo): string => {
    if (coinInfo) {
        return label.replace('#NETWORK', coinInfo.label);
    }
    return label.replace('#NETWORK', '');
};
