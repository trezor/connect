/* @flow */

export function sendMessage(message: any, origin: string) {
    return window.parent.postMessage(message, origin);
}
