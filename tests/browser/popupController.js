// Capture messages
import * as UI from '../../src/js/constants/ui';
import * as common from '../../src/js/popup/view/common';
const channel = new MessageChannel(); // used in direct element communication (iframe.postMessage)

console.log("init!", UI)
window.addEventListener('message', message => {
    
    if (message.data && message.data.type === 'popup-init') {
        console.log("CAPUTRED", message);
        const { settings } = message.data.payload;
        const broadcastID = `${settings.env}-${settings.timestamp}`;
        initMessageChannel(broadcastID);
    }
});

const handler = (m) => {
    console.log("HANDLE REAL2", m)
    if (!m.data) return;
    window.opener.postMessage({
        type: '__karma__postMessage',
        
    }, '*');
    const { type, payload } = m.data;
    console.log("HANDLE REAL", type, payload)
    if (type === UI.REQUEST_PERMISSION) {

        window.requestAnimationFrame(() => {
            const confirmButton: HTMLElement = common.container.getElementsByClassName('confirm')[0];
            const cancelButton: HTMLElement = common.container.getElementsByClassName('cancel')[0];
            console.log("click here?", confirmButton, cancelButton)

            setTimeout(() => confirmButton.click(), 1000);
            // confirmButton.click();
        });
    }

    if (type === UI.REQUEST_CONFIRMATION) {

        window.requestAnimationFrame(() => {
            const confirmButton: HTMLElement = common.container.getElementsByClassName('confirm')[0];
            const cancelButton: HTMLElement = common.container.getElementsByClassName('cancel')[0];
            console.log("click here2", confirmButton, cancelButton)
            // confirmButton.click();
            setTimeout(() => confirmButton.click(), 1000);
        });
    }

    if (type === UI.REQUEST_BUTTON) {
        console.log("CONTROLLER!", global.pythonProcess)
    }
}


// initialize message channel with iframe element
const initMessageChannel = (id: string): void => {
    if (typeof BroadcastChannel !== 'undefined') {
        const broadcast = new BroadcastChannel(id);
        broadcast.onmessage = handler;
    }
    // if (!getIframeElement()) {
    //     throw new Error('unable to establish connection with iframe');
    // }
    channel.port1.onmessage = handler;
};
