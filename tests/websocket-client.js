/* @flow */

import WebSocket from 'ws';
import { EventEmitter } from 'events';

const NOT_INITIALIZED = new Error('websocket_not_initialized');

export function createDeferred<T>(id: number | string): Deferred<T> {
    // intentionally ignore below lines in test coverage, they will be overridden in promise creation
    /* istanbul ignore next */
    let localResolve: (t: T) => void = () => {};
    /* istanbul ignore next */
    let localReject: (e?: Error) => void = () => {};

    const promise: Promise<T> = new Promise(async (resolve, reject) => {
        localResolve = resolve;
        localReject = reject;
    });

    return {
        id,
        resolve: localResolve,
        reject: localReject,
        promise,
    };
}

const DEFAULT_TIMEOUT = 6000;
// const DEFAULT_PING_TIMEOUT = 50 * 1000;

export default class Socket extends EventEmitter {
    options: any;
    ws: WebSocket | undefined;
    messageID: number = 0;
    messages: Deferred<any>[] = [];
    subscriptions: Subscription[] = [];
    pingTimeout: ReturnType<typeof setTimeout> | undefined;
    connectionTimeout: ReturnType<typeof setTimeout> | undefined;
    disconnectRequest: Deferred<any> | undefined;

    constructor(options: Options) {
        super();
        this.setMaxListeners(Infinity);
        this.options = options;
    }

    setConnectionTimeout() {
        this.clearConnectionTimeout();
        this.connectionTimeout = setTimeout(
            this.onTimeout.bind(this),
            this.options.timeout || DEFAULT_TIMEOUT
        );
    }

    clearConnectionTimeout() {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = undefined;
        }
    }

    setPingTimeout() {
        // if (this.pingTimeout) {
        //     clearTimeout(this.pingTimeout);
        // }
        // this.pingTimeout = setTimeout(
        //     this.onPing.bind(this),
        //     this.options.pingTimeout || DEFAULT_PING_TIMEOUT
        // );
    }

    onTimeout() {
        const { ws } = this;
        if (!ws) return;
        if (ws.listenerCount('open') > 0) {
            ws.emit('error', 'Websocket timeout');
            try {
                ws.close();
            } catch (error) {
                // empty
            }
        } else {
            this.messages.forEach(m => m.reject(new Error('Websocket timeout ' + this.options.name)));
            ws.close();
        }
    }

    async onPing() {
        // make sure that connection is alive if there are subscriptions
        // if (this.ws && this.isConnected()) {
        //     if (this.subscriptions.length > 0 || this.options.keepAlive) {
        //         await this.getBlockHash(0);
        //     } else {
        //         try {
        //             this.ws.close();
        //         } catch (error) {
        //             // empty
        //         }
        //     }
        // }
    }

    onError() {
        this.dispose();
    }

    send(params) {
        const { ws } = this;
        if (!ws) throw NOT_INITIALIZED;
        const id = this.messageID;

        const dfd = createDeferred(id);
        const req = {
            id,
            ...params,
        };

        this.messageID++;
        this.messages.push(dfd);

        this.setConnectionTimeout();
        this.setPingTimeout();

        ws.send(JSON.stringify(req));
        return dfd.promise;
    }

    onmessage(message) {
        try {
            const resp = JSON.parse(message);
            const { id, success } = resp;
            const dfd = this.messages.find(m => m.id === id);
            if (dfd) {
                if (!success) {
                    dfd.reject(new Error(resp.error));
                } else {
                    dfd.resolve(resp);
                }
                this.messages.splice(this.messages.indexOf(dfd), 1);
            }
        } catch (error) {
            // empty
        }

        if (this.messages.length === 0) {
            this.clearConnectionTimeout();
        }
        this.setPingTimeout();
    }

    connect() {
        // url validation
        let { url } = this.options;
        if (typeof url !== 'string') {
            throw new Error('websocket_no_url');
        }

        if (url.startsWith('https')) {
            url = url.replace('https', 'wss');
        }
        if (url.startsWith('http')) {
            url = url.replace('http', 'ws');
        }

        // set connection timeout before WebSocket initialization
        // it will be be cancelled by this.init or this.dispose after the error
        this.setConnectionTimeout();

        // create deferred promise
        const dfd = createDeferred(-1);

        // initialize connection
        const ws = new WebSocket(url);
        ws.once('error', error => {
            this.dispose();
            dfd.reject(error);
        });
        ws.on('open', () => {
            this.init();
            dfd.resolve();
        });

        this.ws = ws;

        // wait for onopen event
        return dfd.promise;
    }

    init() {
        const { ws } = this;
        if (!ws || !this.isConnected()) {
            throw Error('Blockbook websocket init cannot be called');
        }
        // clear timeout from this.connect
        this.clearConnectionTimeout();

        // remove previous listeners and add new listeners
        ws.removeAllListeners();
        ws.on('error', this.onError.bind(this));
        ws.on('message', this.onmessage.bind(this));
        ws.on('close', () => {
            if (this.disconnectRequest) {
                this.disconnectRequest.resolve();
            }
            this.emit('disconnected');
            this.dispose();
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        // this.dispose();
        this.disconnectRequest = createDeferred(0);
        return this.disconnectRequest.promise;
    }

    isConnected() {
        const { ws } = this;
        return ws && ws.readyState === WebSocket.OPEN;
    }

    dispose() {
        if (this.pingTimeout) {
            clearTimeout(this.pingTimeout);
        }
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
        }

        const { ws } = this;
        if (this.isConnected()) {
            this.disconnect();
        }
        if (ws) {
            ws.removeAllListeners();
        }

        this.removeAllListeners();
        this.disconnectRequest = undefined;
    }
}
