import 'whatwg-fetch';

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