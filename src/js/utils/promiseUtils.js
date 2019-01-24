/* @flow */
'use strict';

import Promise from 'es6-promise';

export async function resolveAfter(msec: number, value: any): Promise {
    return await new Promise((resolve) => {
        setTimeout(resolve, msec, value);
    });
}
