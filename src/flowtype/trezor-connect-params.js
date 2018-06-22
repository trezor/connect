/* @flow */

declare module 'trezor-connect/params' {

    declare type Common = {
        device?: {
            path: string;
            instance: ?number;
            state: ?string;
        },
        useEmptyPassphrase?: boolean;
        keepSession?: boolean;
    }

    declare type $Path = string | Array<number>;

    declare export type P_EthereumGetAddress = Common & {
        path: $Path;
        showOnTrezor?: false;
    }

    declare export type P_EthereumSignTransaction = Common & {
        path: $Path;
        nonce: string;
        gasPrice: string;
        gasLimit: string;
        to: string;
        value: string;
        data: string;
        chainId: number;
    }

    declare export type P_GetAccountInfo = Common & {
        path?: $Path;
        xpub?: string;
        coin: string;
    }
}
