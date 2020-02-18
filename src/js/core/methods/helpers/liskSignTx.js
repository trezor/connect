/* @flow */

import type { LiskTransaction } from '../../../types/networks/lisk';

const FIELDS_TO_RENAME = ['lifetime', 'keysgroup'];

const snakefy = (val: string): string => val.replace(/([A-Z])/g, el => '_' + el.toLowerCase());

const prepareField = (name: string, value: number | string, obj: any) => {
    // Convert camelCase -> snake_keys
    let newName = snakefy(name);

    // convert to snake_keys fields that are not in camelCase format
    if (FIELDS_TO_RENAME.includes(name)) {
        newName = [name.substr(0, 4), '_', name.substr(4)].join('');
    }
    obj[newName] = value;
};

export const prepareTx = (tx: LiskTransaction, newTx: any = {}) => {
    for (const field in tx) {
        const value = tx[field];
        if (typeof value === 'object' && !Array.isArray(value)) {
            newTx[field] = prepareTx(value);
        } else {
            prepareField(field, value, newTx);
        }
    }
    return newTx;
};
