/* @flow */

const colors: {[k: string]: string} = {
    // green
    'DescriptorStream': 'color: #77ab59',
    'DeviceList': 'color: #36802d',
    'Device': 'color: #bada55',
    'Core': 'color: #c9df8a',
    'IFrame': 'color: #FFFFFF; background: #f4a742;',
    'Popup': 'color: #f48a00',
};

type LogMessage = {
    level: string;
    prefix: string;
    message: any[];
    timestamp: number;
}

const MAX_ENTRIES = 100;

class Log {
    prefix: string;
    enabled: boolean;
    css: string;
    messages: LogMessage[];

    constructor(prefix: string, enabled: boolean) {
        this.prefix = prefix;
        this.enabled = enabled;
        this.messages = [];
        this.css = colors[prefix] || 'color: #000000; background: #FFFFFF;';
    }

    addMessage(level: string, prefix: string, ...args: any[]) {
        this.messages.push({
            level: level,
            prefix: prefix,
            message: args,
            timestamp: new Date().getTime(),
        });
        if (this.messages.length > MAX_ENTRIES) {
            this.messages.shift();
        }
    }

    log(...args: any[]) {
        this.addMessage('log', this.prefix, ...args);
        // eslint-disable-next-line no-console
        if (this.enabled) { console.log(this.prefix, ...args); }
    }

    error(...args: any[]) {
        this.addMessage('error', this.prefix, ...args);
        // eslint-disable-next-line no-console
        if (this.enabled) { console.error(this.prefix, ...args); }
    }

    warn(...args: any[]) {
        this.addMessage('warn', this.prefix, ...args);
        // eslint-disable-next-line no-console
        if (this.enabled) { console.warn(this.prefix, ...args); }
    }

    debug(...args: any[]) {
        this.addMessage('debug', this.prefix, ...args);
        // eslint-disable-next-line no-console
        if (this.enabled) { console.log('%c' + this.prefix, this.css, ...args); }
    }
}

const _logs: {[k: string]: Log} = {};

export const initLog = (prefix: string, enabled?: boolean) => {
    const instance = new Log(prefix, !!enabled);
    _logs[prefix] = instance;
    return instance;
};

export const enableLog = (enabled: boolean) => {
    for (const l of Object.keys(_logs)) {
        _logs[l].enabled = enabled;
    }
};

export const enableLogByPrefix = (prefix: string, enabled: boolean) => {
    if (_logs[prefix]) {
        _logs[prefix].enabled = enabled;
    }
};

export const getLog = () => {
    let logs: LogMessage[] = [];
    for (const l of Object.keys(_logs)) {
        logs = logs.concat(_logs[l].messages);
    }
    logs.sort((a, b) => {
        return a.timestamp - b.timestamp;
    });
    return logs;
};
