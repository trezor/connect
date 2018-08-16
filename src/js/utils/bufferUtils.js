/* @flow */
'use strict';

import * as _ from 'lodash';

export const reverseBuffer = (buf: Buffer): Buffer => {
    const copy = Buffer.alloc(buf.length);
    buf.copy(copy);
    [].reverse.call(copy);
    return copy;
};

export function uniq<X>(array: Array<X>, fun: (inp: X) => string | number): Array<X> {
    return _.uniq(array, fun);
}

export const stringToHex = (str: string): string => {
    let hex: string = '';
    for (let i = 0; i < str.length; i++) {
        hex += str[i].charCodeAt(0).toString(16);
    }
    return hex;
};
