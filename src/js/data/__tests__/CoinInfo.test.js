import coinsJSON from '../../../data/coins.json';
import {
    parseCoinsJson,
    getCoinInfo,
    getUniqueNetworks,
} from '../CoinInfo';

describe('data/CoinInfo', () => {
    beforeAll(() => {
        parseCoinsJson(coinsJSON);
    });

    it('getUniqueNetworks', () => {
        const inputs = [
            null,
            getCoinInfo('btc'),
            getCoinInfo('ltc'),
            getCoinInfo('btc'),
            getCoinInfo('ltc'),
            getCoinInfo('ltc'),
        ];
        const result = [
            getCoinInfo('btc'),
            getCoinInfo('ltc'),
        ];
        expect(getUniqueNetworks(inputs)).toEqual(result);
    });
});
