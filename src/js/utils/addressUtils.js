/* @flow */
'use strict';

import { address as BitcoinJSAddress } from 'bitcoinjs-lib-zcash';
import bchaddrjs from 'bchaddrjs';
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
        // cashaddr hack
        // Cashaddr format (with prefix) is neither base58 nor bech32, so it would fail
        // in bitcoinjs-lib-zchash. For this reason, we use legacy format here
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
    throw new Error('Unknown address type.');
};
