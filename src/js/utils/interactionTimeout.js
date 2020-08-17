/* @flow */

import Log, { init } from './debug';

const _log: Log = init('InteractionTimeout');

export default class InteractionTimeout {
    timeout: ?TimeoutID = null;
    seconds: number = 0;

    constructor(seconds: ?number) {
        if (seconds) {
            this.seconds = seconds;
        }
    }

    get seconds() {
        return this.seconds;
    }

    set seconds(seconds: number) {
        this.seconds = seconds;
    }

    /**
     * Start the interaction timer.
     * The timer will fire the cancel function once reached
     * @param {function} cancelFn Function called once the timeout is reached
     * @param {number} seconds Optional parameter to override the seconds property
     * @returns {void}
     */
    start(cancelFn: () => void, seconds: ?number): void {
        const time = seconds || this.seconds;

        // Not worth running for less than a second
        if (time < 1) {
            return;
        }

        // Clear any previous timeouts set (reset)
        this.stop();

        _log.log(`starting interaction timeout for ${time} seconds`);
        this.timeout = setTimeout(async () => {
            _log.log('interaction timed out');
            cancelFn();
        }, 1000 * time);
    }

    /**
     * Stop the interaction timer
     * @returns {void}
     */
    stop(): void {
        if (this.timeout) {
            _log.log('clearing interaction timeout');
            clearTimeout(this.timeout);
        }
    }
}
