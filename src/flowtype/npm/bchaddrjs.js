/* @flow */

declare module 'bchaddrjs' {
    declare module.exports: {
        toCashAddress(address: string): string;
        isCashAddress(address: string): string;
        toLegacyAddress(address: string): string;
    };
}
