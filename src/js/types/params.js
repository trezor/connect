/* @flow */

import type {
    Transaction as EthereumTransaction,
} from './ethereum';

import type {
    Transaction as NEMTransaction,
} from './nem';

import type {
    MultisigRedeemScriptType,
} from './trezor';

import type {
    PreparedTransaction as LiskTransaction,
} from './lisk';

export type $Common = {
    device?: {
        path: string,
        instance?: ?number,
        state?: ?string,
    },
    useEmptyPassphrase?: boolean,
    keepSession?: boolean,
}

export type $Path = string | Array<number>;

export type $CipherKeyValue = {
    path: $Path,
    key?: string,
    value?: string,
    encrypt?: boolean,
    askOnEncrypt?: boolean,
    askOnDecrypt?: boolean,
    iv?: string,
}

export type $ComposeTransaction = $Common & {
    outputs: Array<{ amount: string, address: string }>,
    coin: string,
    push?: boolean,
}

export type $CustomMessage = $Common & {
    messages?: JSON,
    message: string,
    params: JSON,
    callback: (request: any) => Promise<?{ message: string, params?: Object }>,
}

export type $EthereumGetAddress = {
    path: $Path,
    showOnTrezor?: boolean,
}

export type $EthereumSignMessage = $Common & {
    path: $Path,
    message: string,
}

export type $EthereumSignTransaction = $Common & {
    path: $Path,
    transaction: EthereumTransaction,
}

export type $EthereumVerifyMessage = $Common & {
    address: string,
    message: string,
    signature: string,
}

export type $GetAccountInfo = $Common & {
    path?: $Path,
    xpub?: string,
    coin: string,
}

export type $GetAddress = {
    path: $Path,
    coin?: string,
    showOnTrezor?: boolean,
    crossChain?: boolean,
}

export type $GetDeviceState = $Common;

export type $GetFeatures = $Common;

export type $GetPublicKey = {
    path: $Path,
    coin?: string,
    crossChain?: boolean,
}

export type $NEMGetAddress = {
    path: $Path,
    network: number,
    showOnTrezor?: boolean,
}

export type $NEMSignTransaction = $Common & {
    path: $Path,
    transaction: NEMTransaction,
}

export type $PushTransaction = $Common & $Exact<{
    tx: string,
    coin: string,
}>;

export type $RequestLogin = $Common & $Exact<{
    challengeHidden: string,
    challengeVisual: string,
}> | $Common & $Exact<{
    callback: () => Promise<?{ challengeHidden: string, challengeVisual: string}>,
}>

export type $SignMessage = $Common & {
    path: $Path,
    coin: string,
    message: string,
}

// modified types from trezor/TransactionInput (amount: string)
export type TransactionInput = {
    address_n?: Array<number>,
    prev_hash: string,
    prev_index: number,
    script_sig?: string,
    sequence?: number,
    script_type?: 'SPENDADDRESS' | 'SPENDMULTISIG' | 'EXTERNAL' | 'SPENDWITNESS' | 'SPENDP2SHWITNESS',
    multisig?: MultisigRedeemScriptType,
    amount?: string, // only with segwit
    decred_tree?: number,
    decred_script_version?: number,
}
// modified types from trezor/TransactionOutput (amount: string)
export type TransactionOutput = {
    address: string,
    amount: string, // in satoshis
    script_type: 'PAYTOADDRESS',
} | {
    address_n: Array<number>,
    amount: string, // in satoshis
    script_type: 'PAYTOADDRESS' | 'PAYTOP2SHWITNESS',
} | {
    op_return_data: string,
    amount: '0', // fixed value
    script_type: 'PAYTOOPRETURN',
}

export type $SignTransaction = $Common & {
    inputs: Array<TransactionInput>,
    outputs: Array<TransactionOutput>,
    coin: string,
    push?: boolean,
}

export type $LiskGetAddress = $Common & {
    path: $Path,
    showOnTrezor?: boolean,
}

export type $LiskSignMessage = $Common & {
    path: $Path,
    message: string,
}

export type $LiskVerifyMessage = $Common & {
    public_key: string,
    message: string,
    signature: string,
}

export type $LiskSignTransaction = $Common & {
    path: $Path,
    transaction: LiskTransaction,
}

export type $VerifyMessage = $Common & {
    address: string,
    coin: string,
    message: string,
    signature: string,
}
