/* @flow */

// send message from iframe to parent
export function sendMessage(message: any, origin: string) {
    return window.parent.postMessage(message, origin);
}

// send message from popup to parent
export const sendMessageToOpener = (message: any, origin: string) => {
    if (window.opener) {
        return window.opener.postMessage(message, origin);
    } else {
        // webextensions are expecting this message in "content-script" which is running in "this.window", above this script
        window.postMessage(message, window.location.origin);
    }
};
