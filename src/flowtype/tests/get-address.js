/* @flow */
import type {
  MultisigRedeemScriptType,
  InputScriptType,
} from '../../js/types/trezor.js';

declare module 'flowtype/tests/get-address' {
    declare export type TestGetAddressPayload = {
        method: string,
        path: string | Array<number>,
        coin: string,
        showOnTrezor: boolean,
        multisig?: MultisigRedeemScriptType,
        scriptType?: InputScriptType,
    };
    declare export type ExpectedGetAddressResponse = {
        payload: {
            address: string,
        },
    };
}
