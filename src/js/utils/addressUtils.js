/* @flow */

import { address as BitcoinJSAddress } from '@trezor/utxo-lib';
import bchaddrjs from 'bchaddrjs';
import { ERRORS } from '../constants';
import type { BitcoinNetworkInfo } from '../types';

// Base58
const isValidBase58Address = (address: string, network: $ElementType<BitcoinNetworkInfo, 'network'>): boolean => {
    try {
        const decoded = BitcoinJSAddress.fromBase58Check(address);
        if (decoded.version !== network.pubKeyHash && decoded.version !== network.scriptHash) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
};

// segwit native
const isValidBech32Address = (address: string, network: $ElementType<BitcoinNetworkInfo, 'network'>): boolean => {
    try {
        const decoded = BitcoinJSAddress.fromBech32(address);
        if (decoded.version !== 0 || decoded.prefix !== network.bech32) {
            return false;
        }
    } catch (e) {
        return false;
    }
    return true;
};

// BCH cashaddress
const isValidCashAddress = (address: string): boolean => {
    try {
        return bchaddrjs.isCashAddress(address);
    } catch (err) {
        return false;
    }
};

export const isValidAddress = (address: string, coinInfo: BitcoinNetworkInfo): boolean => {
    if (coinInfo.cashAddrPrefix) {
        return isValidCashAddress(address);
    } else {
        return isValidBase58Address(address, coinInfo.network) || isValidBech32Address(address, coinInfo.network);
    }
};

const isBech32 = (address: string): boolean => {
    try {
        BitcoinJSAddress.fromBech32(address);
        return true;
    } catch (e) {
        return false;
    }
};

export const isScriptHash = (address: string, coinInfo: BitcoinNetworkInfo): boolean => {
    if (!isBech32(address)) {
        // Cashaddr format (with prefix) is neither base58 nor bech32, so it would fail
        // in @trezor/utxo-lib. For this reason, we use legacy format here
        if (coinInfo.cashAddrPrefix) {
            address = bchaddrjs.toLegacyAddress(address);
        }

        const decoded = BitcoinJSAddress.fromBase58Check(address);
        if (decoded.version === coinInfo.network.pubKeyHash) {
            return false;
        }
        if (decoded.version === coinInfo.network.scriptHash) {
            return true;
        }
    } else {
        const decoded = BitcoinJSAddress.fromBech32(address);
        if (decoded.data.length === 20) {
            return false;
        }
        if (decoded.data.length === 32) {
            return true;
        }
    }
    throw ERRORS.TypedError('Runtime', 'isScriptHash: Unknown address type');
};

export const getAddressScriptType = (address: string, coinInfo: BitcoinNetworkInfo): 'PAYTOSCRIPTHASH' | 'PAYTOADDRESS' | 'PAYTOWITNESS' => {
    if (isBech32(address)) return 'PAYTOWITNESS';
    return isScriptHash(address, coinInfo) ? 'PAYTOSCRIPTHASH' : 'PAYTOADDRESS';
};

export const getAddressHash = (address: string): Buffer => {
    if (isBech32(address)) return BitcoinJSAddress.fromBech32(address).data;
    if (isValidCashAddress(address)) return BitcoinJSAddress.fromBase58Check(bchaddrjs.toLegacyAddress(address)).hash;
    return BitcoinJSAddress.fromBase58Check(address).hash;
};
