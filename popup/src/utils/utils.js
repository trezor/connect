import fetch from 'whatwg-fetch';
import semvercmp from 'semver-compare';

export const httpRequest = (url, json) => {
    return fetch(url).then((response) => {
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

export const formatAmount = (n) => {
    if ((n / 1e8) < 0.1 && n != 0) {
        let s = (n / 1e5).toString();
        return `${s} mBTC`;
    }
    let s = (n / 1e8).toString();
    return `${s} BTC`;
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

        console.log("semvercmp", semvercmp)
  
        if (semvercmp(firmwareString, requiredFirmware) >= 0) {
            return firmwareString;
        }
    } catch (e) {
        // print error, but don't interrupt application
        console.error(e);
    }
    return null;
}