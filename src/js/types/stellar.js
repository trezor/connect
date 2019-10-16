/* @flow */

// Stellar types from stellar-sdk
// https://github.com/stellar/js-stellar-base

import type { $Path, $Common } from './params';
import type { Unsuccessful$ } from './response';

export type Asset = {
    type: 0 | 1 | 2, // 0: native, 1: credit_alphanum4, 2: credit_alphanum12
    code: string,
    issuer?: string,
}

export type CreateAccountOperation = {
    +type: 'createAccount', // Proto: "StellarCreateAccountOp"
    source?: string, // Proto: "source_account"
    destination: string, // Proto: "new_account",
    startingBalance: string, // Proto: "starting_balance"
}

export type PaymentOperation = {
    +type: 'payment', // Proto: "StellarPaymentOp"
    source?: string, // Proto: "source_account"
    destination: string, // Proto: "destination_account"
    asset?: Asset | typeof undefined, // Proto: ok
    amount: string, // Proto: ok
}

export type PathPaymentOperation = {
    +type: 'pathPayment', // Proto: "StellarPathPaymentOp"
    source?: string, // Proto: "source_account"
    sendAsset: Asset, // Proto: "send_asset"
    sendMax: string, // Proto: "send_max"
    destination: string, // Proto: "destination_account"
    destAsset: Asset, // Proto: "destination_asset"
    destAmount: string, // Proto "destination_amount"
    path?: Array<Asset>, // Proto: "paths"
}

export type PassiveOfferOperation = {
    +type: 'createPassiveOffer', // Proto: "StellarCreatePassiveOfferOp"
    source?: string, // Proto: "source_account"
    buying: Asset, // Proto: "buying_asset"
    selling: Asset, // Proto: "selling_asset"
    amount: string, // Proto: ok
    price: { n: number, d: number }, // Proto: "price_n" and "price_d"
}

export type ManageOfferOperation = {
    +type: 'manageOffer', // Proto: "StellarManageOfferOp"
    source?: string, // Proto: "source_account"
    buying: Asset, // Proto: "buying_asset"
    selling: Asset, // Proto: "selling_asset"
    amount: string, // Proto: ok
    offerId?: string, // Proto: "offer_id" // not found in stellar-sdk
    price: { n: number, d: number }, // Proto: "price_n" and "price_d"
}

export type SetOptionsOperation = {
    +type: 'setOptions', // Proto: "StellarSetOptionsOp"
    source?: string, // Proto: "source_account"
    signer?: {
        type: 0 | 1 | 2,
        key: string | Buffer,
        weight?: number,
    },
    inflationDest?: string, // Proto: "inflation_destination_account"
    clearFlags?: number, // Proto: "clear_flags"
    setFlags?: number, // Proto: "set_flags"
    masterWeight?: number | string, // Proto: "master_weight"
    lowThreshold?: number | string, // Proto: "low_threshold"
    medThreshold?: number | string, // Proto: "medium_threshold"
    highThreshold?: number | string, // Proto: "high_threshold"
    homeDomain?: string, // Proto: "home_domain"
}

export type ChangeTrustOperation = {
    +type: 'changeTrust', // Proto: "StellarChangeTrustOp"
    source?: string, // Proto: "source_account"
    line: Asset, // Proto: ok
    limit?: string, // Proto: ok
}

export type AllowTrustOperation = {
    +type: 'allowTrust', // Proto: "StellarAllowTrustOp"
    source?: string, // Proto: "source_account"
    trustor: string, // Proto: "trusted_account"
    assetCode: string, // Proto: "asset_code"
    assetType: number, // Proto: "asset_type" // TODO not found in stellar-sdk
    authorize?: boolean | typeof undefined, // Proto: "is_authorized" > parse to number
}

export type AccountMergeOperation = {
    +type: 'accountMerge', // Proto: "StellarAccountMergeOp"
    source?: string, // Proto: "source_account"
    destination: string, // Proto: "destination_account"
}

export type ManageDataOperation = {
    +type: 'manageData', // Proto: "StellarManageDataOp"
    source?: string, // Proto: "source_account"
    name: string, // Proto: "key"
    value: string | Buffer | typeof undefined, // Proto: "value"
}

// (?) Missing in stellar API but present in Proto messages
export type BumpSequenceOperation = {
    +type: 'bumpSequence', // Proto: "StellarBumpSequenceOp"
    source?: string, // Proto: "source_account"
    bumpTo: number, // Proto: "bump_to"
}

// (?) Missing in Proto messages, but present in Stellar API
export type InflationOperation = {
    type: 'inflation',
    source?: string, // Proto: "source_account"
}

export type Operation = CreateAccountOperation
    | PaymentOperation
    | PathPaymentOperation
    | PassiveOfferOperation
    | ManageOfferOperation
    | SetOptionsOperation
    | ChangeTrustOperation
    | AllowTrustOperation
    | AccountMergeOperation
    | InflationOperation
    | ManageDataOperation
    | BumpSequenceOperation;

export type Transaction = {
    source: string, // Proto: "source_account"
    fee: number, // Proto: ok
    sequence: string, // Proto: "sequence_number"
    timebounds?: {
        minTime: number, // Proto: "timebounds_start"
        maxTime: number, // Proto: "timebounds_end"
    },
    memo?: {
        type: 0 | 1 | 2 | 3 | 4, // Proto: "memo_type"
        id?: string, // Proto: "memo_id"
        text?: string, // Proto: "memo_text"
        hash?: string | Buffer, // Proto: "memo_hash"
    },
    operations: Array<Operation>, // Proto: calculated array length > "num_operations"
}

export type $StellarSignTransaction = $Common & {
    path: $Path,
    networkPassphrase: string,
    transaction: Transaction,
}

export type StellarSignedTx = {
    publicKey: string,
    signature: string,
}

export type StellarSignTransaction$ = {
    success: true,
    payload: StellarSignedTx,
} | Unsuccessful$;

// get address

export type StellarAddress = {
    address: string,
    path: Array<number>,
    serializedPath: string,
}

export type $StellarGetAddress = {
    path: $Path,
    showOnTrezor?: boolean,
}

export type StellarGetAddress$ = {
    success: true,
    payload: StellarAddress,
} | Unsuccessful$;

export type StellarGetAddress$$ = {
    success: true,
    payload: Array<StellarAddress>,
} | Unsuccessful$;
