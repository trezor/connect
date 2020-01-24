import coinsJSON from '../../../data/coins.json';
import {
    parseCoinsJson,
    getCoinInfo,
    getUniqueNetworks,
    getCoinInfoByCapability,
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

    it('getCoinInfoByCapability', () => {
        expect(getCoinInfoByCapability(['Capability_Bitcoin'])).toMatchObject([
            { name: 'Bitcoin' },
            { name: 'Testnet' },
        ]);

        expect(
            getCoinInfoByCapability(['Capability_Bitcoin', 'Capability_Bitcoin_like']).length
        ).toEqual(coinsJSON.bitcoin.length);

        expect(
            getCoinInfoByCapability(['Capability_Ethereum']).length
        ).toEqual(coinsJSON.eth.length);

        const other = [
            'EOS',
            'Lisk',
            'NEM',
            'Stellar',
            'Tezos',
        ];

        other.forEach(c => {
            expect(getCoinInfoByCapability([`Capability_${c}`])).toMatchObject([
                { name: c },
            ]);
        });

        expect(getCoinInfoByCapability(['Capability_Binance'])).toMatchObject([
            { name: 'Binance Chain', shortcut: 'BNB' },
        ]);

        expect(getCoinInfoByCapability(['Capability_Ripple'])).toMatchObject([
            { name: 'Ripple' },
            { name: 'Ripple Testnet' },
        ]);

        expect(getCoinInfoByCapability(['Capability_U2F'])).toEqual([]);
        expect(getCoinInfoByCapability(['Capability_Monero'])).toEqual([]);

        const all = ['Capability_Bitcoin', 'Capability_Bitcoin_like', 'Capability_Binance', 'Capability_Ethereum', 'Capability_Ripple'].concat(other.map(c => `Capability_${c}`));

        expect(getCoinInfoByCapability(all).length).toEqual(coinsJSON.bitcoin.length + coinsJSON.eth.length + coinsJSON.misc.length);
    });
});
