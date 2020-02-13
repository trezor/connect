/* @flow */
import type {
    EosPermissionLevel,
    EosAuthorizationKey,
    EosActionBuyRamBytes,
    EosActionSellRam,
    EosActionRefund,
    EosActionDeleteAuth,
    EosActionLinkAuth,
    EosActionUnlinkAuth,
} from '../trezor/protobuf';

// get public key

export type EosGetPublicKey = {
    path: string | number[];
    showOnTrezor?: boolean;
}

export type EosPublicKey = {
    wifPublicKey: string;
    rawPublicKey: string;
    path: number[];
    serializedPath: string;
}

// sign tx

export type EosTxHeader = {
    expiration: number | string;
    refBlockNum: number;
    refBlockPrefix: number;
    maxNetUsageWords: number;
    maxCpuUsageMs: number;
    delaySec: number;
}

export type EosAuthorization = {
    threshold: number;
    keys: EosAuthorizationKey[];
    accounts: Array<{
        permission: EosPermissionLevel;
        weight: number;
    }>;
    waits: Array<{
        wait_sec: number;
        weight: number;
    }>;
}

type Action = {
    account: string;
    authorization: EosPermissionLevel[];
}

export type EosTxAction = Action & {
    name: 'transfer';
    data: {
        from: string;
        to: string;
        quantity: string;
        memo?: string;
    };
} | Action & {
    name: 'delegatebw';
    data: {
        from: string;
        receiver: string;
        stake_net_quantity: string;
        stake_cpu_quantity: string;
        transfer?: boolean;
    };
} | Action & {
    name: 'undelegatebw';
    data: {
        from: string;
        receiver: string;
        unstake_net_quantity: string;
        unstake_cpu_quantity: string;
    };
} | Action & {
    name: 'buyram';
    data: {
        payer: string;
        receiver: string;
        quant: string;
    };
} | Action & {
    name: 'buyrambytes';
    data: EosActionBuyRamBytes;
} | Action & {
    name: 'sellram';
    data: EosActionSellRam;
} | Action & {
    name: 'voteproducer';
    data: {
        voter: string;
        proxy: string;
        producers: string[];
    };
} | Action & {
    name: 'refund';
    data: EosActionRefund;
} | Action & {
    name: 'updateauth';
    data: {
        account: string;
        permission: string;
        parent: string;
        auth: EosAuthorization;
    };
} | Action & {
    name: 'deleteauth';
    data: EosActionDeleteAuth;
} | Action & {
    name: 'linkauth';
    data: EosActionLinkAuth;
} | Action & {
    name: 'unlinkauth';
    data: EosActionUnlinkAuth;
} | Action & {
    name: 'newaccount';
    data: {
        creator: string;
        name: string;
        owner: EosAuthorization;
        active: EosAuthorization;
    };
}

// export type Transaction = {
//     chainId: string;
//     header: ?EosTxHeader;
//     actions: EosTxAction[];
// }

export type EosSignTransaction = {
    path: string | number[];
    transaction: {
        chainId: string;
        header: ?EosTxHeader;
        actions: Array<EosTxAction | Action & { name: string; data: string }>;
    };
}

export { EosSignedTx } from '../trezor/protobuf';
