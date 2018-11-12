export function sendMessage(message, origin) {
    return window.parent.postMessage(message, origin);
}
