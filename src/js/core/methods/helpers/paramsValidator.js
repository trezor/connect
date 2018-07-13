/* @flow */
'use strict';

import { invalidParameter } from '../../../constants/errors';
import { fromHardened } from '../../../utils/pathUtils';
import type { CoinInfo } from 'flowtype';

type Param = {
    name: string;
    type?: string;
    obligatory?: true;
}

export const validateParams = (values: Object, fields: Array<Param>): void => {
    fields.forEach(field => {
        if (values.hasOwnProperty(field.name)) {
            if (field.type) {
                if (field.type === 'array') {
                    if (!Array.isArray(values[field.name])) {
                        // invalid type
                        throw invalidParameter(`Parameter "${ field.name }" has invalid type. "${ field.type }" expected.`);
                    }
                } else if (typeof values[field.name] !== field.type) {
                    // invalid type
                    throw invalidParameter(`Parameter "${ field.name }" has invalid type. "${ field.type }" expected.`);
                }
            }
        } else if (field.obligatory) {
            // not found
            throw invalidParameter(`Parameter "${ field.name }" is missing.`)
        }
    });
}

export const validateCoinInfo = (coinInfo: ?CoinInfo, path: Array<number>) => {
    if (coinInfo && coinInfo.slip44 !== fromHardened(path[1])) {
        throw invalidParameter('Parameters "path" and "coin" do not match.');
    }
}
