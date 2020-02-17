/* @flow */
import type { ApplyFlags } from '../../js/types';

export const applyFlags = () => {
    const testPayloads: ApplyFlags[] = [
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
