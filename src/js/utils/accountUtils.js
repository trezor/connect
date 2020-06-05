/* @flow */
import { fromHardened, toHardened } from './pathUtils';
import { ERRORS } from '../constants';
import type { CoinInfo } from '../types';

type Bip44Options = {
    purpose?: number;
    coinType?: number;
}

export const getAccountAddressN = (coinInfo: CoinInfo, accountIndex: number, bip44?: Bip44Options): number[] => {
    if (!coinInfo) {
        throw ERRORS.TypedError('Method_UnknownCoin');
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

export const getAccountLabel = (path: number[], coinInfo: CoinInfo): string => {
    if (coinInfo.type === 'bitcoin') {
        const accountType: number = fromHardened(path[0]);
        const account: number = fromHardened(path[2]);
        let prefix: string = '';

        if (accountType === 48) {
            prefix = 'multisig';
        } else if (accountType === 49 && coinInfo.segwit) {
            prefix = 'segwit';
        } else if (accountType === 44 && coinInfo.segwit) {
            prefix = 'legacy';
        }
        return `${ prefix } <span>account #${(account + 1)}</span>`;
    } else {
        const account: number = fromHardened(path[4]);
        return `account #${(account + 1)}`;
    }
};
