/* @flow */
'use strict';

import { TrezorError } from '../../../constants/errors';
import type { CoinInfo } from 'flowtype';

type Param = {
    name: string;
    type?: string;
    obligatory?: true;
}

export const validateParams = (values: Object, fields: Array<Param>): void => {
    fields.forEach(field => {
        if (values.hasOwnProperty(field.name)) {
            if (field.type && typeof values[field.name] !== field.type) {
                // invalid type
                throw new TrezorError('method_parameters', `Parameter "${field.name}" has invalid type. "${ field.type }" expected.`);
            }
        } else if (field.obligatory) {
            // not found
            throw new TrezorError('method_parameters', `Parameter "${field.name}" is missing.`)
        }
    });
}

export const validateCoinInfo = (coinInfoFromPath: ?CoinInfo, coinInfo: ?CoinInfo) => {
    if (coinInfoFromPath && coinInfo) {
        if (coinInfoFromPath.shortcut !== coinInfo.shortcut) {
            throw new TrezorError('method_parameters', 'Parameters "path" and "coin" do not match');
        }
    }
}
