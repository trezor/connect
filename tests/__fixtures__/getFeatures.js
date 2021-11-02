// firmware should be always set. This tests actually tests the fact that
// we are indeed testing with the firmware version we believe we do.
const [major, minor, patch] = process.env.TESTS_FIRMWARE.split('.');

// if custom build is used, we ignore firmware version numbers
const customFirmwareBuild =
    process.env.TESTS_CUSTOM_FIRMWARE_BUILD || process.env.TESTS_FIRMWARE.indexOf('master') > 0;

export default {
    method: 'getFeatures',
    setup: {
        mnemonic: 'mnemonic_12',
    },
    tests: [
        {
            setup: {
                firmware: [['2.3.0', '2-master']],
            },
            description: 'get features',
            params: {},
            result: {
                device_id: expect.any(String),
                vendor: 'trezor.io',
                major_version: customFirmwareBuild ? expect.any(Number) : Number(major),
                minor_version: customFirmwareBuild ? expect.any(Number) : Number(minor),
                patch_version: customFirmwareBuild ? expect.any(Number) : Number(patch),
                bootloader_mode: null,
                pin_protection: expect.any(Boolean),
                passphrase_protection: expect.any(Boolean),
                language: 'en-US',
                label: expect.any(String),
                initialized: true,
                revision: expect.any(String),
                bootloader_hash: null,
                imported: null,
                unlocked: expect.any(Boolean),
                firmware_present: null,
                needs_backup: expect.any(Boolean),
                flags: expect.any(Number),
                model: 'T',
                fw_major: null,
                fw_minor: null,
                fw_patch: null,
                fw_vendor: null,
                fw_vendor_keys: null,
                unfinished_backup: expect.any(Boolean),
                no_backup: expect.any(Boolean),
                recovery_mode: false,
                capabilities: [
                    'Capability_Bitcoin',
                    'Capability_Bitcoin_like',
                    'Capability_Binance',
                    'Capability_Cardano',
                    'Capability_Crypto',
                    'Capability_EOS',
                    'Capability_Ethereum',
                    'Capability_Monero',
                    'Capability_NEM',
                    'Capability_Ripple',
                    'Capability_Stellar',
                    'Capability_Tezos',
                    'Capability_U2F',
                    'Capability_Shamir',
                    'Capability_ShamirGroups',
                    'Capability_PassphraseEntry',
                ],
                backup_type: 'Bip39',
                sd_card_present: true,
                sd_protection: false,
                wipe_code_protection: false,
                session_id: expect.any(String),
                passphrase_always_on_device: false,
            },
        },
    ],
};
