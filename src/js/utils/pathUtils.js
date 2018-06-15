/* @flow */
'use strict';

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

export const isSegwitPath = (path: Array<number>): boolean => {
    return path[0] === toHardened(49);
}

export const validatePath = (path: string | Array<number>): Array<number> => {
    let valid: ?Array<number>;
    if (typeof path === 'string') {
        valid = getHDPath(path);
    } else if (Array.isArray(path)) {
        valid = path.map((p: any) => {
            const n: number = parseInt(p);
            if (isNaN(p)) {
                throw new Error('Not a valid path.');
            }
            // return (n | HD_HARDENED) >>> 0;
            return n;
        });
    }
    if (!valid) throw new Error('Not a valid path.');
    return valid;
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

export function getIndexFromPath(path: Array<number>) {
    if (path.length !== 3) {
        throw new Error();
    }
    if ((path[0] >>> 0) !== ((44 | HD_HARDENED) >>> 0)) {
        throw new Error();
    }
    if ((path[1] >>> 0) !== ((0 | HD_HARDENED) >>> 0)) {
        throw new Error();
    }
    return ((path[2] & ~HD_HARDENED) >>> 0);
}


export type AccountType = {
    label: string,
    legacy: boolean,
    account: number,
}

// export const getAccountLabelFromPath = (coinLabel: string, path: Array<number>, segwit: boolean): AccountType => {
export const getAccountLabelFromPath = (path: Array<number>, coin: ?CoinInfo | ?string): string => {

    let hasSegwit: boolean = false;
    let coinLabel: string = 'Unknown coin';
    if (coin) {
        if (typeof coin !== 'string') {
            coinLabel = coin.label;
            hasSegwit = coin.segwit;
        } else {
            coinLabel = coin;
        }
    }
    // let hardened = (i) => path[i] & ~HD_HARDENED;
    // return hardened(0) === 44 ? 'legacy' : 'segwit';
    const p1: number = fromHardened(path[0]);
    let label: string;
    let account: number = fromHardened(path[2]);
    let realAccountId: number = account + 1;
    let legacy: boolean = false;
    // Copay id
    if (p1 === 45342) {
        const p2: number = fromHardened(path[1]);
        account = fromHardened(path[3]);
        realAccountId = account + 1;
        label = 'Export Copay ID of';
        if (p2 === 48) {
            label = ' multisig';
        } else if (p2 === 44) {
            label = ' legacy';
            legacy = true;
        }
        label += ` account #${realAccountId}`;
    } else if (p1 === 48) {
        label = `Export public key for multisig ${coinLabel} account #${realAccountId}`;
    } else if (p1 === 44 && hasSegwit) {
        label = `Export public key for legacy ${coinLabel} account #${realAccountId}`;
        legacy = true;
    } else {
        label = `Export public key of ${coinLabel} account #${realAccountId}`;
    }

    return label;

    // return {
    //     label: label,
    //     account: account,
    //     legacy: legacy,
    // };
};
