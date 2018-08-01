/*
Passing messages from background script to popup
*/

const port = chrome.runtime.connect( { name: 'trezor-connect' } );
port.onMessage.addListener(message => {
    window.postMessage(message, window.location.origin);
});

/*
Passing messages from popup to background script
*/

window.addEventListener('message', event => {
    if (event.source == window && event.data) {
        port.postMessage(event.data);
    }
});
