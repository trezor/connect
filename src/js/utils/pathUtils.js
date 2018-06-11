/* @flow */
'use strict';

import { getCoinName } from '../data/CoinInfo';
import type { CoinInfo } from 'flowtype';

export const HD_HARDENED: number = 0x80000000;
export const toHardened = (n: number): number => (n | HD_HARDENED) >>> 0;
export const fromHardened = (n: number): number => (n & ~HD_HARDENED) >>> 0;

export const getHDPath = (path: string): Array<number> => {
    return path
        .toLowerCase()
        .split('/')
        .filter((p: string) => p !== 'm')
        .map((p: string) => {
            let hardened: boolean = false;
            if (p.substr(p.length - 1) === "'") {
                hardened = true;
                p = p.substr(0, p.length - 1);
            }
            let n: number = parseInt(p);
            if (isNaN(p)) {
                throw new Error('Not a valid path.');
            }
            if (hardened) { // hardened index
                n = toHardened(n);
            }
            return n;
        });
};

export const isSegwitPath = (path: Array<number> | any): boolean => {
    return Array.isArray(path) && path[0] === toHardened(49);
}

export const validatePath = (path: string | Array<number>, base: boolean = false): Array<number> => {
    let valid: ?Array<number>;
    if (typeof path === 'string') {
        valid = getHDPath(path);
    } else if (Array.isArray(path)) {
        valid = path.map((p: any) => {
            let n: number = parseInt(p);
            if (isNaN(p)) {
                throw new Error('Not a valid path.');
            } else if (n < 0) {
                n *= -1;
                return (n | HD_HARDENED) >>> 0;
            }
            return n;
        });
    }
    if (!valid) throw new Error('Not a valid path.');
    return base ? valid.splice(0, 3) : valid;
};

export const getAccountIndexFromPath = (path: Array<number>): number => {
    return path[2] & ~HD_HARDENED;
};

export function getSerializedPath(path: Array<number>): string {
    return path.map((i) => {
        const s = (i & ~HD_HARDENED).toString();
        if (i & HD_HARDENED) {
            return s + "'";
        } else {
            return s;
        }
    }).join('/');
}

export const getPathFromIndex = (bip44purpose: number, bip44cointype: number, index: number): Array<number> => {
    return [
        toHardened(bip44purpose),
        toHardened(bip44cointype),
        toHardened(index),
    ];
};

export function getIndexFromPath(path: Array<number>): number {
    if (path.length < 3) {
        throw new Error(`getIndexFromPath: invalid path length ${ path.toString() }`);
    }
    // if ((path[0] >>> 0) !== ((44 | HD_HARDENED) >>> 0)) {
    //     throw new Error("2");
    // }
    // if ((path[1] >>> 0) !== ((0 | HD_HARDENED) >>> 0)) {
    //     throw new Error("3");
    // }
    return fromHardened(path[2]);
}

export const getAccountLabel = (path: Array<number>, coinInfo: CoinInfo): string => {
    let coinLabel: string = coinInfo.label;
    const p1: number = fromHardened(path[0]);
    let account: number = fromHardened(path[2]);
    let realAccountId: number = account + 1;
    let prefix: string = 'Export info of';
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

export const getPublicKeyLabel = (path: Array<number>, coinInfo: ?CoinInfo): string => {
    let hasSegwit: boolean = false;
    let coinLabel: string = 'Unknown coin';
    if (coinInfo) {
        coinLabel = coinInfo.label;
        hasSegwit = coinInfo.segwit;
    } else {
        coinLabel = getCoinName(path);
    }

    const p1: number = fromHardened(path[0]);
    let account: number = fromHardened(path[2]);
    let realAccountId: number = account + 1;
    let prefix: string = 'Export public key of';
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
    } else {
        accountType = coinLabel;
    }
    return `${ prefix } ${ accountType } <span>account #${realAccountId}</span>`;
}
