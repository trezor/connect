import { CoinInfo } from '@trezor/connect-common';
import coinsJSON from '@trezor/connect-common/lib/files/coins.json';
import * as utils from '../addressUtils';
import * as fixtures from '../__fixtures__/addressUtils';

describe('utils/addressUtils', () => {
    beforeAll(() => {
        // load coin definitions
        CoinInfo.parseCoinsJson(coinsJSON);
    });

    describe('isValidAddress', () => {
        fixtures.validAddresses.forEach(f => {
            it(`${f.description} ${f.address}`, () => {
                expect(utils.isValidAddress(f.address, CoinInfo.getBitcoinNetwork(f.coin))).toEqual(
                    true,
                );
            });
        });

        fixtures.invalidAddresses.forEach(f => {
            it(`Invalid ${f.coin} ${f.address}`, () => {
                expect(utils.isValidAddress(f.address, CoinInfo.getBitcoinNetwork(f.coin))).toEqual(
                    false,
                );
            });
        });
    });
});
