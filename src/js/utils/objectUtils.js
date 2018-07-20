/* @flow */
'use strict';

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function entries<T>(obj: { [string]: T }): Array<[string, T]> {
    const keys : string[] = Object.keys(obj);
    return keys.map(key => [ key, obj[key] ]);
}

export function deepClone(obj: any, hash: any = new WeakMap()) {
    // if (Object(obj) !== obj) return obj; // primitives
    // if (hash.has(obj)) return hash.get(obj); // cyclic reference
    // const result = Array.isArray(obj) ? [] : obj.constructor ? new obj.constructor() : Object.create(null);
    // hash.set(obj, result);
    // if (obj instanceof Map) { Array.from(obj, ([key, val]) => result.set(key, deepClone(val, hash))); }
    // return Object.assign(result, ...Object.keys(obj).map(
    //     key => ({ [key]: deepClone(obj[key], hash) })));
}

export function snapshot(obj: any) {
    if (obj == null || typeof (obj) !== 'object') {
        return obj;
    }

    const temp = new obj.constructor();

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            temp[key] = snapshot(obj[key]);
        }
    }
    return temp;
}

export function objectValues<X>(object: {[key: string]: X}): Array<X> {
    return Object.keys(object).map(key => object[key]);
}
