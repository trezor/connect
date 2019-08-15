/* @flow */

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';
import type {
    EosPermissionLevel,
    EosAuthorizationKey,
    EosActionBuyRamBytes,
    EosActionSellRam,
    EosActionRefund,
    EosActionDeleteAuth,
    EosActionLinkAuth,
    EosActionUnlinkAuth,
    EosSignedTx,
} from './trezor';

// get public key

export type EosPublicKey = {
    wifPublicKey: string,
    rawPublicKey: string,
    path: Array<number>,
    serializedPath: string,
}

export type $EosGetPublicKey = {
    path: $Path,
    showOnTrezor?: boolean,
}

export type EosGetPublicKey$ = {
    success: true,
    payload: EosPublicKey,
} | Unsuccessful$;

export type EosGetPublicKey$$ = {
    success: true,
    payload: Array<EosPublicKey>,
} | Unsuccessful$;

// sign tx

export type EosTxHeader = {
    expiration: number | string,
    refBlockNum: number,
    refBlockPrefix: number,
    maxNetUsageWords: number,
    maxCpuUsageMs: number,
    delaySec: number,
}

export type EosAuthorization = {
    threshold: number,
    keys: Array<EosAuthorizationKey>,
    accounts: Array<{
        permission: EosPermissionLevel,
        weight: number,
    }>,
    waits: Array<{
        wait_sec: number,
        weight: number,
    }>,
}

type Action = {
    account: string,
    authorization: Array<EosPermissionLevel>,
}

export type EosTxAction = Action & {
    name: 'transfer',
    data: {
        from: string,
        to: string,
        quantity: string,
        memo?: string,
    },
} | Action & {
    name: 'delegatebw',
    data: {
        from: string,
        receiver: string,
        stake_net_quantity: string,
        stake_cpu_quantity: string,
        transfer?: boolean,
    },
} | Action & {
    name: 'undelegatebw',
    data: {
        from: string,
        receiver: string,
        unstake_net_quantity: string,
        unstake_cpu_quantity: string,
    },
} | Action & {
    name: 'buyram',
    data: {
        payer: string,
        receiver: string,
        quant: string,
    },
} | Action & {
    name: 'buyrambytes',
    data: EosActionBuyRamBytes,
} | Action & {
    name: 'sellram',
    data: EosActionSellRam,
} | Action & {
    name: 'voteproducer',
    data: {
        voter: string,
        proxy: string,
        producers: Array<string>,
    },
} | Action & {
    name: 'refund',
    data: EosActionRefund,
} | Action & {
    name: 'updateauth',
    data: {
        account: string,
        permission: string,
        parent: string,
        auth: EosAuthorization,
    },
} | Action & {
    name: 'deleteauth',
    data: EosActionDeleteAuth,
} | Action & {
    name: 'linkauth',
    data: EosActionLinkAuth,
} | Action & {
    name: 'unlinkauth',
    data: EosActionUnlinkAuth,
} | Action & {
    name: 'newaccount',
    data: {
        creator: string,
        name: string,
        owner: EosAuthorization,
        active: EosAuthorization,
    },
}

export type Transaction = {
    chainId: string,
    header: ?EosTxHeader,
    actions: Array<EosTxAction>,
}

export type $EosSignTx = $Common & {
    path: $Path,
    transaction: {
        chainId: string,
        header: ?EosTxHeader,
        actions: Array<EosTxAction | Action & { name: string, data: string }>,
    },
}

export type EosSignTx$ = {
    success: true,
    payload: EosSignedTx,
} | Unsuccessful$;
