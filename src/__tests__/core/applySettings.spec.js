export const applySettings = () => {
    const testPayloads = [
        {
            method: 'applySettings',
            label: 'hello',
            auto_lock_delay: 300,
            display_rotation: 90,
            use_passphrase: true,
        },
    ];
    const expectedResponses = [
        {
            payload: {
                message: 'Settings applied',
            },
            success: true,
        },
    ];
    const testName = 'ApplySettings';

    return {
        testPayloads,
        expectedResponses,
        testName,
        mnemonic: 'mnemonic_12',
    };
};
