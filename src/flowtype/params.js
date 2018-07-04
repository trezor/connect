/* @flow */

declare module 'flowtype/params' {

    import type {
        Transaction as EthereumTransaction
    } from 'flowtype/Ethereum';

    import type {
        Transaction as NEMTransaction
    } from 'flowtype/NEM';

    import type {
        Transaction as StellarTransaction
    } from 'flowtype/Stellar';

    import type {
        TransactionInput,
        TransactionOutput
    } from 'flowtype/trezor';

    declare type Common = {
        device?: {
            path: string;
            instance?: ?number;
            state?: ?string;
        },
        useEmptyPassphrase?: boolean;
        keepSession?: boolean;
    }

    declare type $Path = string | Array<number>;

    declare export type P_CipherKeyValue = Common & {
        path: $Path;
        key?: string;
        value?: string;
        encrypt?: boolean;
        askOnEncrypt?: boolean;
        askOnDecrypt?: boolean;
        iv?: string;
    }

    declare export type P_CustomMessage = Common & {
        messages?: JSON;
        message: string;
        params: JSON;
        callback: (request: any) => Promise<?{ message: string, params?: Object }>;
    }

    declare export type P_ComposeTransaction = Common & {
        messages?: any // TODO
    }

    declare export type P_EthereumGetAddress = Common & {
        path: $Path;
        showOnTrezor?: boolean;
    }

    declare export type P_EthereumSignMessage = Common & {
        path: $Path;
        message: string;
    }

    declare export type P_EthereumSignTransaction = Common & {
        path: $Path;
        transaction: EthereumTransaction;
    }

    declare export type P_EthereumVerifyMessage = Common & {
        address: string;
        message: string;
        signature: string;
    }

    declare export type P_GetAccountInfo = Common & {
        path?: $Path;
        xpub?: string;
        coin: string;
    }

    declare export type P_GetAddress = Common & {
        path: $Path;
        coin?: string;
        showOnTrezor?: boolean;
    }

    declare export type P_GetDeviceState = Common;

    declare export type P_GetFeatures = Common;

    declare export type P_GetPublicKey = Common & {
        path: $Path;
        coin?: string;
    }

    declare export type P_RequestLogin = Common & {
       challengeHidden?: string;
       challengeVisible?: string;
       asyncChallenge?: boolean;
       callback?: () => Promise<?{ hidden: string, visual: string}>;
    }

    declare export type P_NEMGetAddress = Common & {
        path: $Path;
        network: number;
        showOnTrezor?: boolean;
    }

    declare export type P_NEMSignTransaction = Common & {
        path: $Path;
        transaction: NEMTransaction;
    }

    declare export type P_SignMessage = Common & {
        path: $Path;
        coin: string;
        message: string;
    }

    declare export type P_SignTransaction = Common & {
        inputs: Array<TransactionInput>;
        outputs: Array<TransactionOutput>;
        coin: string;
    }

    declare export type P_StellarGetAddress = Common & {
        path: $Path;
        showOnTrezor?: boolean;
    }

    declare export type P_StellarSignTransaction = Common & {
        path?: $Path;
        ledgerVersion?: number;
        networkPassphrase?: string;
        transaction: StellarTransaction;
    }

    declare export type P_VerifyMessage = Common & {
        address: string;
        coin: string;
        message: string;
        signature: string;
    }
}
