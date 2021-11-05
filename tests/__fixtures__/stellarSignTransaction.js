import commonFixtures from '../../submodules/trezor-common/tests/fixtures/stellar/sign_tx.json';
import {
    Enum_StellarMemoType,
    Enum_StellarAssetType,
    Enum_StellarSignerType,
} from '../../src/js/types/trezor/protobuf';

// operations are in protobuf format (snake_case)

const transformAsset = asset => ({
    type: Enum_StellarAssetType[asset.type],
    code: asset.code,
    issuer: asset.issuer,
});

const transformOperation = op => {
    switch (op._message_type) {
        case 'StellarBumpSequenceOp':
            return {
                type: 'bumpSequence',
                bumpTo: op.bump_to,
            };
        case 'StellarAccountMergeOp':
            return {
                type: 'accountMerge',
                destination: op.destination_account,
            };
        case 'StellarCreateAccountOp':
            return {
                type: 'createAccount',
                destination: op.new_account,
                startingBalance: op.starting_balance.toString(),
            };
        case 'StellarPaymentOp':
            return {
                type: 'payment',
                source: op.source_account,
                destination: op.destination_account,
                asset: transformAsset(op.asset),
                amount: op.amount.toString(),
            };
        case 'StellarAllowTrustOp':
            return {
                type: 'allowTrust',
                trustor: op.trusted_account,
                assetType: transformAsset({ type: op.asset_type }).type,
                assetCode: op.asset_code,
                authorize: op.is_authorized,
            };
        case 'StellarChangeTrustOp':
            return {
                type: 'changeTrust',
                line: transformAsset(op.asset),
                limit: op.limit.toString(),
            };
        case 'StellarCreatePassiveSellOfferOp':
            return {
                type: 'createPassiveSellOffer',
                source: op.source_account,
                buying: transformAsset(op.buying_asset),
                selling: transformAsset(op.selling_asset),
                amount: op.amount.toString(),
                price: { n: op.price_n, d: op.price_d },
            };
        case 'StellarManageSellOfferOp':
            return {
                type: 'manageSellOffer',
                source: op.source_account,
                buying: transformAsset(op.buying_asset),
                selling: transformAsset(op.selling_asset),
                amount: op.amount.toString(),
                offerId: op.offer_id,
                price: { n: op.price_n, d: op.price_d },
            };
        case 'StellarManageBuyOfferOp':
            return {
                type: 'manageBuyOffer',
                source: op.source_account,
                buying: transformAsset(op.buying_asset),
                selling: transformAsset(op.selling_asset),
                amount: op.amount.toString(),
                offerId: op.offer_id,
                price: { n: op.price_n, d: op.price_d },
            };
        case 'StellarPathPaymentStrictReceiveOp':
            return {
                type: 'pathPaymentStrictReceive',
                source: op.source_account,
                sendAsset: transformAsset(op.send_asset),
                sendMax: op.send_max,
                destination: op.destination_account,
                destAsset: transformAsset(op.destination_asset),
                destAmount: op.destination_amount.toString(),
                path: op.paths,
            };
        case 'StellarPathPaymentStrictSendOp':
            return {
                type: 'pathPaymentStrictSend',
                source: op.source_account,
                sendAsset: transformAsset(op.send_asset),
                sendAmount: op.send_amount,
                destination: op.destination_account,
                destAsset: transformAsset(op.destination_asset),
                destMin: op.destination_min.toString(),
                path: op.paths,
            };
        case 'StellarManageDataOp':
            return {
                type: 'manageData',
                source: op.source_account,
                name: op.key,
                value: op.value,
            };
        case 'StellarSetOptionsOp':
            return {
                type: 'setOptions',
                source: op.source_account,
                clearFlags: op.clear_flags,
                setFlags: op.set_flags,
                masterWeight: op.master_weight,
                lowThreshold: op.low_threshold,
                medThreshold: op.medium_threshold,
                highThreshold: op.high_threshold,
                homeDomain: op.home_domain,
                inflationDest: op.inflation_destination_account,
                signer: {
                    type: Enum_StellarSignerType[op.signer_type],
                    key: op.signer_key,
                    weight: op.signer_weight,
                },
            };
        default:
            return [];
    }
};

export default {
    method: 'stellarSignTransaction',
    setup: {
        mnemonic: commonFixtures.setup.mnemonic,
    },
    tests: commonFixtures.tests.map(({ name, parameters, result }) => ({
        description: name,
        params: {
            path: parameters.address_n,
            networkPassphrase: parameters.network_passphrase,
            transaction: {
                source: parameters.tx.source_account,
                fee: parameters.tx.fee,
                sequence: parameters.tx.sequence_number,
                timebounds: {
                    minTime: parameters.tx.timebounds_start,
                    maxTime: parameters.tx.timebounds_end,
                },
                memo: {
                    type: Enum_StellarMemoType[parameters.tx.memo_type],
                    text: parameters.tx.memo_text,
                    id: parameters.tx.memo_id,
                    hash: parameters.tx.memo_hash,
                },
                operations: parameters.operations.flatMap(transformOperation),
            },
        },
        result: {
            publicKey: result.public_key,
            signature: Buffer.from(result.signature, 'base64').toString('hex'),
        },
    })),
};
