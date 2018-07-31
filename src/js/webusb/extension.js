/* @flow */

const onLoad = () => {

    const button = document.getElementsByTagName('button')[0];

    button.onclick = async () => {
        // TODO: get it from config.json
        const TREZOR_DESCS = [
            // TREZOR v1
            { vendorId: 0x534c, productId: 0x0001 },
            // TREZOR v2 Bootloader
            { vendorId: 0x1209, productId: 0x53c0 },
            // TREZOR v2 Firmware
            { vendorId: 0x1209, productId: 0x53c1 },
        ];

        const usb = navigator.usb;
        if (usb) {
            try {
                await usb.requestDevice({filters: TREZOR_DESCS});
            } catch (error) {
                console.log('Webusb', error);
            }
            window.top.postMessage('usb-permissions-close', '*')
        }
    };

}
window.addEventListener('load', onLoad, false);
