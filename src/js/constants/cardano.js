/* @flow */

export const PROTOCOL_MAGICS = Object.freeze({
    mainnet: 764824073,
    testnet: 42,
});

export const NETWORK_IDS = Object.freeze({
    mainnet: 1,
    testnet: 0,
});

export const ADDRESS_TYPE = Object.freeze({
    Base: 0,
    Pointer: 4,
    Enterprise: 6,
    Byron: 8,
    Reward: 14,
});

export const CERTIFICATE_TYPE = Object.freeze({
    StakeRegistration: 0,
    StakeDeregistration: 1,
    StakeDelegation: 2,
});
