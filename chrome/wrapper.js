var chrome = window.chrome;

var port = chrome.runtime.connect({name: 'trezor-connect'});

var view = document.getElementById('view');

window.addEventListener('message', function (event) {
    port.postMessage(event.data);
});

port.onMessage.addListener(function (msg) {
    view.contentWindow.postMessage(msg, '*');
});

view.addEventListener('contentload', function () {
    view.contentWindow.postMessage('handshake', '*');
});
