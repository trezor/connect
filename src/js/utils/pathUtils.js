/* @flow */

import { ERRORS } from '../constants';
import type { CoinInfo } from '../types';
import type { InputScriptType, ChangeOutputScriptType, TxInputType, TxOutputType } from '../types/trezor/protobuf';

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

export const getOutputScriptType = (path?: number[]): ChangeOutputScriptType => {
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

export const fixPath = <T: TxInputType | TxOutputType>(utxo: T): T => {
    // make sure bip32 indices are unsigned
    if (utxo.address_n && Array.isArray(utxo.address_n)) {
        utxo.address_n = utxo.address_n.map((i) => i >>> 0);
    }
    return utxo;
};

export const getLabel = (label: string, coinInfo: ?CoinInfo): string => {
    if (coinInfo) {
        return label.replace('#NETWORK', coinInfo.label);
    }
    return label.replace('#NETWORK', '');
};
