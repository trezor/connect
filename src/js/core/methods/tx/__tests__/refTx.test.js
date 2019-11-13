import { inputToHD } from '../inputs';
import { getReferencedTransactions } from '../refTx';

describe('core/methods/tx/refTx', () => {
    it('getReferencedTransactions', () => {
        const inputs = [
            inputToHD({ prev_hash: 'abcd' }),
            inputToHD({ prev_hash: 'abcd' }),
            inputToHD({ prev_hash: 'deadbeef' }),
            inputToHD({ prev_hash: 'abcd' }),
            inputToHD({ prev_hash: 'deadbeef' }),
            inputToHD({ prev_hash: 'dcba' }),
        ];
        const result = ['abcd', 'deadbeef', 'dcba'];
        expect(getReferencedTransactions(inputs)).toEqual(result);
    });
});
