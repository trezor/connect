/* @flow */
import { toHardened } from './pathUtils';
import type { CoinInfo } from '../types';

type Bip44Options = {
    purpose?: number,
    coinType?: number,
}

export const getAccountAddressN = (coinInfo: CoinInfo, accountIndex: number, bip44?: Bip44Options): number[] => {
    if (!coinInfo) {
        throw new Error('no coin info');
    }
    const index = typeof accountIndex === 'number' ? accountIndex : 0;
    const options = {
        purpose: 44,
        coinType: coinInfo.slip44,
        ...bip44,
    };

    if (coinInfo.type === 'bitcoin') {
        return [toHardened(options.purpose), toHardened(options.coinType), toHardened(index)];
    } else if (coinInfo.type === 'ethereum') {
        return [toHardened(options.purpose), toHardened(options.coinType), toHardened(0), 0, index];
    } else if (coinInfo.shortcut === 'tXRP') {
        // FW bug: https://github.com/trezor/trezor-firmware/issues/321
        return [toHardened(options.purpose), toHardened(144), toHardened(index), 0, 0];
    } else {
        // TODO: cover all misc coins or throw error
        return [toHardened(options.purpose), toHardened(options.coinType), toHardened(index), 0, 0];
    }
};

// export const getNetworkInfo = (label: string, networks: CoinInfo[]): string => {
//     if (networks.length === 1) {
//         const name = networks[0].name.toLowerCase().indexOf('testnet') >= 0 ? 'Testnet' : networks[0].name;
//         return label.replace('#NETWORK', name);
//     } else {
//         const uniqNetworks: CoinInfo[] = [];
//         networks.forEach(n => {
//             if (uniqNetworks.indexOf(n) < 0) {
//                 uniqNetworks.push(n);
//             }
//         });

//         if (uniqNetworks.length === 1) {
//             const name = uniqNetworks[0].name.toLowerCase().indexOf('testnet') >= 0 ? 'Testnet' : uniqNetworks[0].name;
//             return label.replace('#NETWORK', name);
//         } else {

//         }
//     }
//     if (network) {
//         const name: string = network.name.toLowerCase().indexOf('testnet') >= 0 ? 'Testnet' : network.name;
//         return label.replace('#NETWORK', name);
//     }
//     return label.replace('#NETWORK', '');
// };
