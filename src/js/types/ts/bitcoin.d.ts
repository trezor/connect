/* @flow */

// getAddress params
export type GetAddress = {
    path: string | number[];
    address?: string;
    showOnTrezor?: boolean;
    coin?: string;
    crossChain?: boolean;
    bundle?: typeof undefined;
};

// getAddress response
export type Address = {
    address: string;
    path: number[];
    serializedPath: string;
};
