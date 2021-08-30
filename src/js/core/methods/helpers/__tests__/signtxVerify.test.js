import { networks } from '@trezor/utxo-lib';

import verifyTx from '../signtxVerify';
import fixtures from '../__fixtures__/signtxVerify';

const getHDNode = () => ({
    xpub: '',
});

describe('helpers/signtxVerify', () => {
    fixtures.forEach(f => {
        it(f.description, async () => {
            const call = () =>
                verifyTx(f.getHDNode || getHDNode, f.inputs, f.outputs, f.tx, {
                    network: f.network ? networks[f.network] : networks.bitcoin,
                });
            if (f.error) {
                await expect(call()).rejects.toThrow(f.error);
            } else {
                await expect(call()).resolves.not.toThrow();
            }
        });
    });
});
