import 'whatwg-fetch';
import semvercmp from 'semver-compare';
import * as _ from 'lodash';

export const httpRequest = (url: string, json: boolean): any => {
    return fetch(url, { credentials: 'same-origin' }).then((response) => {
        if (response.status === 200) {
            return response.text().then(result => (json ? JSON.parse(result) : result));
        } else {
            throw new Error(response.statusText);
        }
    })
}

export const formatTime = (n) => {
    let hours = Math.floor(n / 60);
    let minutes = n % 60;
    
    if (!n) return 'No time estimate';
    let res = '';
    if (hours != 0) {
        res += hours + ' hour';
        if (hours > 1) {
            res += 's';
        }
        res += ' ';
    }
    if (minutes != 0) {
        res += minutes + ' minutes';
    }
    return res;
}

let currencyUnits = 'mbtc';
export const setCurrencyUnits = (units) => {
    currencyUnits = units;
}

export const formatAmount = (n, coinInfo) => {
    let amount = (n / 1e8);
    if (coinInfo.isBitcoin && currencyUnits === 'mbtc' && amount < 0.1 && n != 0) {
        let s = (n / 1e5).toString();
        return `${s} mBTC`;
    }
    let s = amount.toString();
    return `${s} ${coinInfo.shortcut}`;
}


export const parseRequiredFirmware = (firmware, requiredFirmware) => {
    if (firmware == null) {
        return null;
    }
    try {
        let firmwareString = '';
        if (typeof firmware === 'string') {
            firmwareString = firmware;
        } else {
            // this can cause an exception, but we run this in try anyway
            firmwareString = firmware.map((n) => n.toString()).join('.');
        }
  
        const split = firmwareString.split('.');
        if (split.length !== 3) {
            throw new Error('Firmware version is too long');
        }
        if (!(split[0].match(/^\d+$/)) || !(split[1].match(/^\d+$/)) || !(split[2].match(/^\d+$/))) {
            throw new Error('Firmware version not valid');
        }
  
        if (semvercmp(firmwareString, requiredFirmware) >= 0) {
            return firmwareString;
        }
    } catch (e) {
        // print error, but don't interrupt application
        console.error(e);
    }
    return null;
}

export function sortBy<X>(array: Array<X>, fun: (x: X) => Array<number>, inplace: boolean = false): Array<X> {
    const copy = inplace ? array : array.slice();
    copy.sort((a, b) => {
        const aArr = fun(a);
        const bArr = fun(b);
        if (aArr.length !== bArr.length) {
            throw new Error('Different array length');
        }
        for (let i = 0; i < aArr.length; i++) {
            const aVal = aArr[i];
            const bVal = bArr[i];
            if (aVal !== bVal) {
                return aVal - bVal;
            }
        }
        return 0;
    });
    return copy;
}

export function range(a: number, b?: number): Array<number> {
    return _.range(a, b);
}

export function at<X>(array: Array<X>, permutation: Array<number>): Array<X> {
    return _.at(array, permutation);
}

export function uniq<X>(array: Array<X>, fun: (inp: X) => string | number): Array<X> {
    return _.uniq(array, fun);
}

export const reverseBuffer = (src: Buffer): Buffer => {
    const buffer = new Buffer(src.length);
    for (let i = 0, j = src.length - 1; i <= j; ++i, --j) {
        buffer[i] = src[j];
        buffer[j] = src[i];
    }
    return buffer;
}