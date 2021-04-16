const BitcoinJs = require('@trezor/utxo-lib');

// Referenced transaction generator script.
// Transform bitcoin-like transaction data in to format required by tests of signTransaction method.
// Data are stored in <project-root>/tests/__txcache__/[network]

// Step 1.
// Go to blockchain explorer and find referenced tx by input.prev_hash and locate tx HEX
const hex = '';
if (!hex) throw new Error('tx hex not provided');

// Step 2. set network
// optionally for DOGE, enable support of string values (big amounts)
BitcoinJs.Transaction.USE_STRING_VALUES = false;
const tx = BitcoinJs.Transaction.fromHex(hex, BitcoinJs.networks.testnet);

const reverseBuffer = buf => {
    const copy = Buffer.alloc(buf.length);
    buf.copy(copy);
    [].reverse.call(copy);
    return copy;
};

const inputsMap = input => ({
    prev_index: input.index,
    sequence: input.sequence,
    prev_hash: reverseBuffer(input.hash).toString('hex'),
    script_sig: input.script.toString('hex'),
});

const binOutputsMap = output => ({
    amount: output.value,
    script_pubkey: output.script.toString('hex'),
});

const extraData = tx.getExtraData();
const version_group_id =
    BitcoinJs.coins.isZcashType(tx.network) &&
    typeof tx.versionGroupId === 'number' &&
    tx.version >= 3
        ? tx.versionGroupId
        : undefined;

const refTx = {
    version: tx.isDashSpecialTransaction() ? tx.version | (tx.type << 16) : tx.version,
    inputs: tx.ins.map(inputsMap),
    bin_outputs: tx.outs.map(binOutputsMap),
    extra_data: extraData ? extraData.toString('hex') : undefined,
    lock_time: tx.locktime,
    timestamp: tx.timestamp,
    version_group_id,
    expiry: tx.expiryHeight,
};

// Step 3. run script
// node tests/__txcache__/gen-reftx.js > tests/__txcache__/[network]/[input.prev_hash].json
// node tests/__txcache__/gen-reftx.js > tests/__txcache__/dash/adb43bcd8fc99d6ed353c30ca8e5bd5996cd7bcf719bd4253f103dfb7227f6ed.json
// node tests/__txcache__/gen-reftx.js > tests/__txcache__/testnet/f405b50dff7053f3697f485f95fe1c0f6a4f5e52446281b4ef470c2762a15dae.json
console.log(JSON.stringify(refTx, null, 2));
