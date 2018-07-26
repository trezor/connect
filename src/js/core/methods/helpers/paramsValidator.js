/* @flow */
'use strict';

import { invalidParameter } from '../../../constants/errors';
import { fromHardened } from '../../../utils/pathUtils';
import semvercmp from 'semver-compare';
import type { CoinInfo } from 'flowtype';

type Param = {
    name: string,
    type?: string,
    obligatory?: true,
}

export const validateParams = (values: Object, fields: Array<Param>): void => {
    fields.forEach(field => {
        if (values.hasOwnProperty(field.name)) {
            const value = values[field.name];
            if (field.type) {
                if (field.type === 'array') {
                    if (!Array.isArray(value)) {
                        // invalid type
                        throw invalidParameter(`Parameter "${ field.name }" has invalid type. "${ field.type }" expected.`);
                    } else if (value.length < 1) {
                        throw invalidParameter(`Parameter "${ field.name }" is empty.`);
                    }
                } else if (typeof value !== field.type) {
                    // invalid type
                    throw invalidParameter(`Parameter "${ field.name }" has invalid type. "${ field.type }" expected.`);
                }
            }
        } else if (field.obligatory) {
            // not found
            throw invalidParameter(`Parameter "${ field.name }" is missing.`);
        }
    });
};

export const validateCoinPath = (coinInfo: ?CoinInfo, path: Array<number>): void => {
    if (coinInfo && coinInfo.slip44 !== fromHardened(path[1])) {
        throw invalidParameter('Parameters "path" and "coin" do not match.');
    }
};

export const getRequiredFirmware = (coinInfo: CoinInfo, current: Array<string>): Array<string> => {
    if (semvercmp(coinInfo.support.trezor1, current[0]) > 0) {
        current[0] = coinInfo.support.trezor1;
    }

    if (semvercmp(coinInfo.support.trezor2, current[1]) > 0) {
        current[1] = coinInfo.support.trezor2;
    }

    return current;
};

export const isHex = (valToTest: string): boolean => {
    let isHex = true;
    for (let i = 0; i < valToTest.length - 1; i++) {
        const currentChar = valToTest.charAt(i);
        const currentCharNum = parseInt(currentChar, 16);

        if (currentCharNum.toString(16) !== currentChar || isNaN(currentCharNum)) {
            isHex = false;
            break;
        }
    }
    return isHex;
}
