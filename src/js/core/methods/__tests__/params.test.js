import { find } from '../index';
import { fixtures } from '../__fixtures__/params';
import coinsJSON from '../../../../data/coins.json';
import { parseCoinsJson } from '../../../data/CoinInfo';

describe('core/methods params validation', () => {
    beforeAll(() => {
        parseCoinsJson(coinsJSON);
    });
    Object.keys(fixtures).forEach(key => {
        fixtures[key].forEach(f => {
            it(`${key}: ${f.description}`, () => {
                try {
                    const method = find({
                        id: 0,
                        payload: {
                            method: key,
                            ...f.params,
                        },
                    });
                    method.device = {
                        unavailableCapabilities: {},
                    };
                } catch (error) {
                    expect(error.message).toBe(f.error);
                }
            });
        });
    });
});
