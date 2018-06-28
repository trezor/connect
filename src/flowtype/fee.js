/* @flow */

declare module 'flowtype/fee' {

    declare type LegacyBitcoreFeeLevelInfo = {
        +type: 'bitcore-legacy',
        +blocks: number,
    };

    declare export type LegacyBitcoreFeeLevel = {
        +name: string,
        +id: number,
        +info: LegacyBitcoreFeeLevelInfo,
    }

    declare type SmartBitcoreFeeLevelInfo = {
        +type: 'bitcore-smart',
        +blocks: number,
    };

    declare export type SmartBitcoreFeeLevel = {
        +name: string,
        +id: number,
        +info: SmartBitcoreFeeLevelInfo,
    }

    declare type PreloadedFeeLevelInfo = {
        +type: 'preloaded',
        +fee: number,
    }

    declare type CustomFeeLevelInfo = {
        +type: 'custom',
        fee: string,
    }

    declare export type CustomFeeLevel = {
        +name: string,
        +id: number,
        +info: CustomFeeLevelInfo,
    }

    declare export type FeeLevelInfo = LegacyBitcoreFeeLevelInfo | SmartBitcoreFeeLevelInfo | PreloadedFeeLevelInfo | CustomFeeLevelInfo;

    declare export type SelectFeeLevel = {
        +name: string;
        +fee: 0;
        +disabled: true;
    } | {
        +name: string;
        +fee: number;
        +feePerByte: number;
        +minutes: number;
        +total: number;
    }

    declare export type FeeLevel = {
        +name: string,
        +id: number,
        +info: FeeLevelInfo,
    }



}
