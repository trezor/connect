const StellarSdk = require('stellar-sdk');
const BigNumber = require('bignumber.js');

/**
 * Transforms StellarSdk.Signer to trezor-connect Signer
 * @param {StellarSdk.Signer} signer
 * @returns { type: 1 | 2 | 3, key: string, weight: number }
 */
const transformSigner = (signer) => {
    let type = 0;
    let key;
    const weight = signer.weight;
    if (typeof signer.ed25519PublicKey === 'string') {
        const keyPair = StellarSdk.Keypair.fromPublicKey(signer.ed25519PublicKey);
        key = keyPair.rawPublicKey().toString('hex');
    }
    if (signer.preAuthTx instanceof Buffer) {
        type = 1;
        key = signer.preAuthTx.toString('hex');
    }
    if (signer.sha256Hash instanceof Buffer) {
        type = 2;
        key = signer.sha256Hash.toString('hex');
    }
    return {
        type,
        key,
        weight,
    };
};

/**
 * Transforms StellarSdk.Asset to trezor-connect Asset
 * @param {StellarSdk.Asset} asset
 * @returns { type: 0 | 1 | 2, code: string, issuer?: string }
 */
const transformAsset = (asset) => {
    if (asset.isNative()) {
        return {
            type: 0,
            code: asset.getCode(),
        };
    }
    return {
        type: asset.getAssetType() === 'credit_alphanum4' ? 1 : 2,
        code: asset.getCode(),
        issuer: asset.getIssuer(),
    };
};

/**
 * Transforms amount from decimals (lumens) to integer (stroop)
 * @param {string} amount
 * @returns {string}
 */
const transformAmount = (amount) => {
    return new BigNumber(amount).times(10000000).toString();
};

/**
 * Transforms StellarSdk.Operation.type to trezor-connect Operation.type
 * @param {string} type
 * @returns {string}
 */
const transformType = (type) => {
    switch (type) {
        case 'pathPaymentStrictReceive':
        // case 'pathPaymentStrictSend':
            return 'pathPayment';

        case 'createPassiveSellOffer':
            return 'createPassiveOffer';

        case 'manageSellOffer':
        // case 'manageBuyOffer':
            return 'manageOffer';
        default:
            return type;
    }
};

/**
 * Transforms StellarSdk.Memo to trezor-connect Transaction.Memo
 * @param {string} type
 * @returns {string}
 */
const transformMemo = (memo) => {
    switch (memo.type) {
        case StellarSdk.MemoText:
            return { type: 1, text: memo.value };
        case StellarSdk.MemoID:
            return { type: 2, id: memo.value };
        case StellarSdk.MemoHash:
            // stringify is not necessary, Buffer is also accepted
            return { type: 3, hash: memo.value.toString('hex') };
        case StellarSdk.MemoReturn:
            // stringify is not necessary, Buffer is also accepted
            return { type: 4, hash: memo.value.toString('hex') };
        default:
            return { type: 0 };
    }
};

/**
 * Transforms StellarSdk.Transaction.timeBounds to trezor-connect Transaction.timebounds
 * @param {string} path
 * @param {StellarSdk.Transaction.timeBounds} timebounds
 * @returns {minTime: number, maxTime: number}
 */
const transformTimebounds = (timebounds) => {
    if (!timebounds) return undefined;
    // those values are defined in Trezor firmware messages as numbers
    return {
        minTime: Number.parseInt(timebounds.minTime, 10),
        maxTime: Number.parseInt(timebounds.maxTime, 10),
    };
};

/**
 * Transforms StellarSdk.Transaction to trezor-connect Transaction
 * @param {string} path
 * @param {StellarSdk.Transaction} transaction
 * @returns {string}
 */
const transformTransaction = (path, transaction) => {
    const amounts = ['amount', 'sendMax', 'destAmount', 'startingBalance', 'limit'];
    const assets = ['asset', 'sendAsset', 'destAsset', 'selling', 'buying', 'line'];

    const operations = transaction.operations.map((o, i) => {
        const operation = Object.assign({}, o);

        // transform StellarSdk.Signer
        if (operation.signer) {
            operation.signer = transformSigner(operation.signer);
        }

        // transform "price" field to { n: number, d: number }
        if (typeof operation.price === 'string') {
            const xdrOperation = transaction.tx.operations()[i];
            operation.price = {
                n: xdrOperation.body().value().price().n(),
                d: xdrOperation.body().value().price().d(),
            };
        }

        // transform amounts
        amounts.forEach(field => {
            if (typeof operation[field] === 'string') {
                operation[field] = transformAmount(operation[field]);
            }
        });

        // transform assets
        assets.forEach(field => {
            if (operation[field]) {
                operation[field] = transformAsset(operation[field]);
            }
        });

        // add missing field
        if (operation.type === 'allowTrust') {
            const allowTrustAsset = new StellarSdk.Asset(operation.assetCode, operation.trustor);
            operation.assetType = transformAsset(allowTrustAsset).type;
        }

        if (operation.type === 'manageData') {
            // stringify is not necessary, Buffer is also accepted
            operation.value = operation.value.toString('hex');
        }

        // transform type
        operation.type = transformType(o.type);

        return operation;
    });

    return {
        path,
        networkPassphrase: transaction.networkPassphrase,
        transaction: {
            source: transaction.source,
            fee: transaction.fee,
            sequence: transaction.sequence,
            memo: transformMemo(transaction.memo),
            timebounds: transformTimebounds(transaction.timeBounds),
            operations,
        },
    };
};

exports['default'] = transformTransaction;
module.exports = exports.default;
