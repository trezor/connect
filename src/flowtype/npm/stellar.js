/* @flow */
// Stellar types from stellar-sdk
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/stellar-sdk/index.d.ts

declare module 'flowtype/Stellar' {

    declare type PUBLIC = 'Public Global Stellar Network ; September 2015';
    declare type TESTNET = 'Test SDF Network ; September 2015';

    // Combined two types from stellar API: "LedgerRecord" and "TransactionRecord"
    declare export type Transaction = {
        path: Array<number> | string; // Missing in stellar API, Proto: address_n
        protocol_version: number; // from "LedgerRecord", Proto: ok
        sequence: number; // from "LedgerRecord": "sequence" ?? or from "TransactionRecord" "source_account_sequence"? > Proto: "sequence_number"
        network_passphrase: PUBLIC | TESTNET; // Possible other values?, Proto: ok
        timebounds_start: number, // IDK what field from stellar API? Is it from "TransactionRecord" "created_at"?, Proto: ok
        timebounds_end: number, // IDK what field from stellar API ??
        // memo: string; // Stellar API has only "memo_text" type?
        memo_type: number; // Missing in stellar API, Proto: ok
        memo_text: string; // Missing in stellar API, Proto: ok
        memo_id: number; // Missing in stellar API, Proto: ok
        memo_hash: string; // Missing in stellar API, Proto: ok
        operations: Array<Operation>; // Proto: calculated array length as "num_operations"
        source_account: string; // Proto: ok
        max_fee: number; // from "TransactionRecord" Should it be just "fee"? Proto: ok
    }

    declare export type CreateAccountOperationRecord = {
        type: 'create_account'; // Proto: "StellarCreateAccountOp"
        account: string; // Proto: "new_account",
        funder: string; // Proto: "source_account"
        starting_balance: string; // Proto: parse to number
    }

    declare export type PaymentOperationRecord = {
        type: 'payment'; // Proto: "StellarPaymentOp"
        from: string; // Proto: "source_account"
        to: string; // Proto: "destination_account"
        asset_type: string; // Proto: StellarAssetType (object "asset")
        asset_code?: string; // Proto: StellarAssetType (object "asset")
        asset_issuer?: string; // Proto: StellarAssetType (object "asset")
        amount: string; // Proto: parse to number
    }

    declare export type PathPaymentOperationRecord = {
        type: 'path_payment'; // Proto: "StellarPathPaymentOp"
        from: string; // Proto: "source_account"
        to: string; // Proto: "destination_account"
        asset_code?: string; // Proto: StellarAssetType (object "destination_asset")
        asset_issuer?: string; // Proto: StellarAssetType (object "destination_asset")
        asset_type: string; // Proto: StellarAssetType (object "destination_asset")
        amount: string; // Proto: "destination_amount" : number
        source_asset_code?: string; // Proto: StellarAssetType (object "send_asset")
        source_asset_issuer?: string; // Proto: StellarAssetType (object "send_asset")
        source_asset_type: string; // Proto: StellarAssetType (object "send_asset")
        source_max: string; // Proto: "send_max" ??
        source_amount: string; // Missing in Proto
        // paths:  // Missing in stellar API, Proto: StellarAssetType
    }

    declare export type ManageOfferOperationRecord = {
        type: 'manage_offer'; // Proto: "StellarManageOfferOp"
        offer_id: number; // Proto: ok
        amount: string; // Proto: parse to number
        buying_asset_code?: string; // Proto: StellarAssetType (object "buying_asset")
        buying_asset_issuer?: string; // Proto: StellarAssetType (object "buying_asset")
        buying_asset_type: string; // Proto: StellarAssetType (object "buying_asset")
        price: string; // Proto: "price_n" : number ??
        price_r: { numerator: number, denominator: number }; // Proto: "price_d": number ??
        selling_asset_code?: string; // Proto: StellarAssetType (object "selling_asset")
        selling_asset_issuer?: string; // Proto: StellarAssetType (object "selling_asset")
        selling_asset_type: string; // Proto: StellarAssetType (object "selling_asset")
    }

    declare export type PassiveOfferOperationRecord = {
        type: 'create_passive_offer';
        offer_id: number; // Proto: ok
        amount: string; // Proto: ok
        buying_asset_code?: string; // Proto: StellarAssetType (object "buying_asset")
        buying_asset_issuer?: string; // Proto: StellarAssetType (object "buying_asset")
        buying_asset_type: string; // Proto: StellarAssetType (object "buying_asset")
        price: string; // Proto: "price_n" ??
        price_r: { numerator: number, denominator: number }; // Proto: "price_d" ??
        selling_asset_code?: string; // Proto: StellarAssetType (object "selling_asset")
        selling_asset_issuer?: string; // Proto: StellarAssetType (object "selling_asset")
        selling_asset_type: string; // Proto: StellarAssetType (object "selling_asset")
    }

    declare export type SetOptionsOperationRecord = {
        type: 'set_options'; // Proto: "StellarCreatePassiveOfferOp"
        // signer_type: number;  // missing in stellar API
        signer_key?: string; // Proto: ok
        signer_weight?: number; // Proto: ok
        master_key_weight?: number; // Proto: "master_weight"
        low_threshold?: number; // Proto: ok
        med_threshold?: number; // Proto: "medium_threshold"
        high_threshold?: number; // Proto: ok
        home_domain?: string; // Proto: ok
        set_flags: Array<(1 | 2)>; // Proto: ok
        set_flags_s: Array<('auth_required_flag' | 'auth_revocable_flag')>;
        clear_flags: Array<(1 | 2)>; // Proto: ok
        lear_flags_s: Array<('auth_required_flag' | 'auth_revocable_flag')>;
        // inflation_destination_account: string // missing in stellar API
    }

    declare export type ChangeTrustOperationRecord = {
        type: 'change_trust'; // Proto: "StellarChangeTrustOp"
        asset_code: string; // Proto: StellarAssetType (object "asset")
        asset_issuer: string; // Proto: StellarAssetType (object "asset")
        asset_type: string; // Proto: StellarAssetType (object "asset")
        trustee: string; // Missing in Proto
        trustor: string; // Proto: "source_account"
        limit: string; // Proto: parse to number
    }

    declare export type AllowTrustOperationRecord = {
        type: 'allow_trust'; // Proto: "StellarAllowTrustOp"
        asset_code: string; // Proto: ok
        asset_issuer: string; // Proto: missing
        asset_type: string; // Proto: parse to number
        authorize: boolean; // Proto: "is_authorized" number
        trustee: string; // Proto: missing?? or ("source_account")
        trustor: string; // Proto: "trusted_account" ??
    }

    declare export type AccountMergeOperationRecord = {
        type: 'account_merge'; // Proto: "StellarAccountMergeOp"
        into: string; // Proto: "destination_account" ??
        //source_account: string // Missing in stellar API, Proto: ok
    }

    // Missing in Proto
    declare export type InflationOperationRecord = {
        type: 'inflation';
    }

    declare export type ManageDataOperationRecord = {
        type: 'manage_data'; // Proto: "StellarManageDataOp"
        name: string; // Proto: "key"
        value: string; // Proto: "value"
    }

    // Missing in stellar API
    declare export type BumpSequenceOperationRecord = {
        type: 'bump_sequence'; // Proto: "StellarBumpSequenceOp"
        source_account: string; // Proto: ok
        bump_to: number; // Proto: ok
    }

    declare export type Operation = CreateAccountOperationRecord
        | PaymentOperationRecord
        | PathPaymentOperationRecord
        | ManageOfferOperationRecord
        | PassiveOfferOperationRecord
        | SetOptionsOperationRecord
        | ChangeTrustOperationRecord
        | AllowTrustOperationRecord
        | AccountMergeOperationRecord
        | InflationOperationRecord
        | ManageDataOperationRecord
        | BumpSequenceOperationRecord;
}
