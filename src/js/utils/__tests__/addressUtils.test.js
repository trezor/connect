import coinsJSON from '../../../data/coins.json';
import { parseCoinsJson, getBitcoinNetwork } from '../../data/CoinInfo';
import * as utils from '../addressUtils';
import * as fixtures from '../__fixtures__/addressUtils';

describe('utils/addressUtils', () => {
    beforeAll(() => {
        // load coin definitions
        parseCoinsJson(coinsJSON);
    });

    describe('isValidAddress', () => {
        fixtures.validAddresses.forEach(f => {
            it(`${f.description} ${f.address}`, () => {
                expect(utils.isValidAddress(f.address, getBitcoinNetwork(f.coin))).toEqual(true);
            });
        });

        fixtures.invalidAddresses.forEach(f => {
            it(`Invalid ${f.coin} ${f.address}`, () => {
                expect(utils.isValidAddress(f.address, getBitcoinNetwork(f.coin))).toEqual(false);
            });
        });
    });

    describe('getAddressScriptType', () => {
        fixtures.validAddresses.forEach(f => {
            it(`${f.description} ${f.address}`, () => {
                expect(utils.getAddressScriptType(f.address, getBitcoinNetwork(f.coin))).toEqual(
                    f.scriptType,
                );
            });
        });
    });

    describe('getAddressHash', () => {
        fixtures.validAddresses.forEach(f => {
            it(`${f.description} ${f.address}`, () => {
                expect(utils.getAddressHash(f.address).toString('hex')).toEqual(f.addressHash);
            });
        });
    });

    describe('isScriptHash', () => {
        fixtures.validAddresses.forEach(f => {
            it(`${f.description} ${f.address}`, () => {
                expect(utils.isScriptHash(f.address, getBitcoinNetwork(f.coin))).toEqual(
                    f.isScriptHash,
                );
            });
        });
    });
});
