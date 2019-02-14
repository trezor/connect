/* @flow */

type LegacyBitcoreFeeLevelInfo = {
    +type: 'bitcore-legacy',
    +blocks: number,
};

export type LegacyBitcoreFeeLevel = {
    +name: string,
    +id: number,
    +info: LegacyBitcoreFeeLevelInfo,
}

type SmartBitcoreFeeLevelInfo = {
    +type: 'bitcore-smart',
    +blocks: number,
};

export type SmartBitcoreFeeLevel = {
    +name: string,
    +id: number,
    +info: SmartBitcoreFeeLevelInfo,
}

type PreloadedFeeLevelInfo = {
    +type: 'preloaded',
    +fee: number,
}

type CustomFeeLevelInfo = {
    +type: 'custom',
    fee: string,
}

export type CustomFeeLevel = {
    +name: string,
    +id: number,
    +info: CustomFeeLevelInfo,
}

export type FeeLevelInfo = LegacyBitcoreFeeLevelInfo | SmartBitcoreFeeLevelInfo | PreloadedFeeLevelInfo | CustomFeeLevelInfo;

export type SelectFeeLevel = {
    +name: string,
    +fee: 0,
    +disabled: true,
} | {
    +name: string,
    +fee: number,
    +feePerByte: number,
    +minutes: number,
    +total: number,
}

export type FeeLevel = {
    +name: string,
    +id: number,
    +info: FeeLevelInfo,
}
