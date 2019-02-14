/* @flow */

declare module 'bchaddrjs' {
    declare module.exports: {
        isCashAddress(address: string): boolean,
        toCashAddress(address: string): string,
        isLegacyAddress(address: string): boolean,
        toLegacyAddress(address: string): string,
    };
}
