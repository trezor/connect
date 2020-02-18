/* @flow */

// https://stackoverflow.com/questions/7505623/colors-in-javascript-console
// https://github.com/pimterry/loglevel/blob/master/lib/loglevel.js

// http://www.color-hex.com/color-palette/5016
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
    message: Array<any>;
    timestamp: number;
}

export default class Log {
    prefix: string;
    enabled: boolean;
    css: string;
    messages: Array<LogMessage>;

    constructor(prefix: string, enabled: boolean = false) {
        this.prefix = prefix;
        this.enabled = enabled;
        this.messages = [];
        this.css = colors[prefix] || 'color: #000000; background: #FFFFFF;';
    }

    addMessage(level: string, prefix: string, ...args: Array<any>): void {
        this.messages.push({
            level: level,
            prefix: prefix,
            message: args,
            timestamp: new Date().getTime(),
        });
    }

    log(...args: Array<any>): void {
        this.addMessage('log', this.prefix, ...args);
        // eslint-disable-next-line no-console
        if (this.enabled) { console.log(this.prefix, ...args); }
    }

    error(...args: Array<any>): void {
        this.addMessage('error', this.prefix, ...args);
        // eslint-disable-next-line no-console
        if (this.enabled) { console.error(this.prefix, ...args); }
    }

    warn(...args: Array<any>): void {
        this.addMessage('warn', this.prefix, ...args);
        // eslint-disable-next-line no-console
        if (this.enabled) { console.warn(this.prefix, ...args); }
    }

    debug(...args: Array<any>): void {
        this.addMessage('debug', this.prefix, ...args);
        // eslint-disable-next-line no-console
        if (this.enabled) { console.log('%c' + this.prefix, this.css, ...args); }
    }
}

const _logs: {[k: string]: Log} = {};

export const init = (prefix: string, enabled?: boolean): Log => {
    const enab: boolean = typeof enabled === 'boolean' ? enabled : false;
    const instance: Log = new Log(prefix, enab);
    _logs[prefix] = instance;
    return instance;
};

export const enable = (enabled: boolean): void => {
    for (const l of Object.keys(_logs)) {
        _logs[l].enabled = enabled;
    }
};

export const getLog = (args: ?Array<string>): Array<LogMessage> => {
    // if
    let logs: Array<LogMessage> = [];
    for (const l of Object.keys(_logs)) {
        logs = logs.concat(_logs[l].messages);
    }
    logs.sort((a, b) => {
        return a.timestamp - b.timestamp;
    });
    return logs;
};

export const enableByPrefix = (prefix: string, enabled: boolean): void => {
    if (_logs[prefix]) {
        _logs[prefix].enabled = enabled;
    }
};

// TODO: enable/disable log at runtime
export const popupConsole = (tag: string, postMessage: Function): void => {
    const c = global.console;
    const orig: Object = {
        error: c.error,
        // warn: c.warn,
        info: c.info,
        debug: c.debug,
        log: c.log,
    };
    const log = [];

    const inject = (method, level) => {
        return (...args) => {
            // args.unshift('[popup.js]');
            const time = new Date().toUTCString();
            log.push([level, time].concat(args));
            postMessage.apply(this, [
                { type: tag, level: level, time: time, args: JSON.stringify(args) },
                // { type: 'LOG', level: level, time: time, args: JSON.stringify(deepClone(args)) }
            ]);
            return method.apply(c, args);
        };
    };

    for (const level in orig) {
        c[level] = inject(orig[level], level);
    }
};
