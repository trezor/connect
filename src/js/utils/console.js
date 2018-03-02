/* @flow */
'use strict';

export function popupConsole(tag: string, postMessage: Function) {
    const c = global.console;
    const orig = {
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
}
