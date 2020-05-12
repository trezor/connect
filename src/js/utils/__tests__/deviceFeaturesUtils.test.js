import coinsJSON from '../../../data/coins.json';
import configJSON from '../../../data/config.json';
import { parseCoinsJson, getAllNetworks } from '../../data/CoinInfo';

import { versionCompare, parseCapabilities, getUnavailableCapabilities } from '../deviceFeaturesUtils';

describe('utils/deviceFeaturesUtils', () => {
    beforeAll(() => {
        parseCoinsJson(coinsJSON);
    });

    it('versionCompare', () => {
        expect(versionCompare(null, null)).toEqual(0);
        expect(versionCompare('abcd', null)).toEqual(0);
        expect(versionCompare(null, 'abcd')).toEqual(0);
        expect(versionCompare({}, {})).toEqual(0);
        expect(versionCompare('1.2.3', '1.2.3')).toEqual(0);
        expect(versionCompare('1.2.3', '1.2.4')).toEqual(-1);
        expect(versionCompare('1.2.3', '1.2.2')).toEqual(1);
        expect(versionCompare('1.2.3', '1.2')).toEqual(1);
        expect(versionCompare('1.2', '1.2.1')).toEqual(-1);
        expect(versionCompare([], [])).toEqual(0);
        expect(versionCompare([1], [2])).toEqual(-1);
        expect(versionCompare(['a'], ['b'])).toEqual(0);
        expect(versionCompare([null], [1])).toEqual(-1);
        expect(versionCompare([1], [null])).toEqual(1);
        expect(versionCompare([1, 2, 3], [1, 2, 4])).toEqual(-1);
        expect(versionCompare([1, 2, 3], [1, 2, 2])).toEqual(1);
    });

    it('parseCapabilities', () => {
        const feat1 = {
            major_version: 1,
        };
        const feat2 = {
            major_version: 2,
        };
        // default T1
        expect(parseCapabilities(feat1)).toEqual([
            'Capability_Bitcoin',
            'Capability_Bitcoin_like',
            'Capability_Crypto',
            'Capability_Ethereum',
            'Capability_Lisk',
            'Capability_NEM',
            'Capability_Stellar',
            'Capability_U2F',
        ]);

        // default T2
        expect(parseCapabilities(feat2)).toEqual([
            'Capability_Bitcoin',
            'Capability_Bitcoin_like',
            'Capability_Binance',
            'Capability_Cardano',
            'Capability_Crypto',
            'Capability_EOS',
            'Capability_Ethereum',
            'Capability_Lisk',
            'Capability_Monero',
            'Capability_NEM',
            'Capability_Ripple',
            'Capability_Stellar',
            'Capability_Tezos',
            'Capability_U2F',
        ]);

        expect(parseCapabilities({
            major_version: 2,
            capabilities: [],
        })).toEqual([
            'Capability_Bitcoin',
            'Capability_Bitcoin_like',
            'Capability_Binance',
            'Capability_Cardano',
            'Capability_Crypto',
            'Capability_EOS',
            'Capability_Ethereum',
            'Capability_Lisk',
            'Capability_Monero',
            'Capability_NEM',
            'Capability_Ripple',
            'Capability_Stellar',
            'Capability_Tezos',
            'Capability_U2F',
        ]);

        // bitcoin only
        expect(parseCapabilities({
            major_version: 1,
            capabilities: [1],
        })).toEqual([
            'Capability_Bitcoin',
        ]);

        // no features
        expect(parseCapabilities(null)).toEqual([]);

        // unknown
        expect(parseCapabilities({
            major_version: 1,
            capabilities: [1000],
        })).toEqual([
            'Capability_Unknown_trezor-connect',
        ]);
    });

    it('getUnavailableCapabilities', () => {
        const support = configJSON.supportedFirmware;
        const coins = getAllNetworks();

        const feat1 = {
            major_version: 1,
            minor_version: 8,
            patch_version: 3,
            capabilities: undefined,
        };
        feat1.capabilities = parseCapabilities(feat1);

        // default Capabilities T1
        expect(getUnavailableCapabilities(feat1, coins, support)).toEqual({
            ada: 'no-capability',
            bnb: 'no-capability',
            eos: 'no-capability',
            ere: 'update-required',
            ppc: 'update-required',
            tppc: 'update-required',
            txrp: 'no-capability',
            uno: 'update-required',
            xrp: 'no-capability',
            xtz: 'no-capability',
            zcr: 'update-required',
        });

        const feat2 = {
            major_version: 2,
            minor_version: 2,
            patch_version: 0,
            capabilities: undefined,
        };
        feat2.capabilities = parseCapabilities(feat2);

        // default Capabilities T2
        expect(getUnavailableCapabilities(feat2, coins, support)).toEqual({
            ere: 'update-required',
        });

        // excluded single method without specified coins
        expect(
            getUnavailableCapabilities(
                feat2,
                coins,
                [
                    {
                        min: ['0', '2.3.0'],
                        excludedMethods: ['getAccountInfo'],
                    },
                ]
            ),
        ).toEqual({
            ere: 'update-required',
            getAccountInfo: 'update-required',
        });

        // excluded single method with specified coins
        expect(
            getUnavailableCapabilities(
                feat2,
                coins,
                [
                    {
                        min: ['0', '2.3.0'],
                        coin: ['xrp', 'txrp'],
                        excludedMethods: ['getAccountInfo'],
                    },
                ]
            ),
        ).toEqual({
            ere: 'update-required',
            getAccountInfo: ['xrp', 'txrp'],
        });

        // disable multiple methods for outdated trezor-connect
        expect(
            getUnavailableCapabilities(
                feat2,
                coins,
                [
                    {
                        max: ['0', '2.1.0'],
                        coin: ['xrp', 'txrp'],
                        excludedMethods: ['rippleGetAddress'],
                    },
                    {
                        max: ['0', '2.1.0'],
                        excludedMethods: ['tezosSignTransaction'],
                    },
                ]
            ),
        ).toEqual({
            ere: 'update-required',
            rippleGetAddress: ['xrp', 'txrp'],
            tezosSignTransaction: 'trezor-connect-outdated',
        });

        // without capabilities
        expect(getUnavailableCapabilities({}, coins, support)).toEqual({});
    });
});
