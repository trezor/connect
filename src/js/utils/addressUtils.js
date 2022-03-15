/* @flow */

import { address as BitcoinJSAddress } from '@trezor/utxo-lib';
import type { BitcoinNetworkInfo } from '@trezor/connect-common';

// Base58
const isValidBase58Address = (
    address: string,
    network: $ElementType<BitcoinNetworkInfo, 'network'>,
) => {
    try {
        const decoded = BitcoinJSAddress.fromBase58Check(address, network);
        if (decoded.version !== network.pubKeyHash && decoded.version !== network.scriptHash) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
};

// segwit native
const isValidBech32Address = (
    address: string,
    network: $ElementType<BitcoinNetworkInfo, 'network'>,
) => {
    try {
        const decoded = BitcoinJSAddress.fromBech32(address);
        if (decoded.prefix !== network.bech32) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
};

export const isValidAddress = (address: string, coinInfo: BitcoinNetworkInfo) =>
    isValidBase58Address(address, coinInfo.network) ||
    isValidBech32Address(address, coinInfo.network);
