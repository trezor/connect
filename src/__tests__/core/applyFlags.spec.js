export const applyFlags = () => {
    const testPayloads = [
        {
            method: 'applyFlags',
            flags: 1,
        },
    ];
    const expectedResponses = [
        {
            payload: {
                message: 'Flags applied',
            },
            success: true,
        },
    ];
    const testName = 'ApplyFlags';

    return {
        testPayloads,
        expectedResponses,
        testName,
        mnemonic: 'mnemonic_12',
    };
};
