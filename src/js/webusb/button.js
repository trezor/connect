/* @flow */

const render = (className: ?string, url: string) => {
    const query = className || '.trezor-webusb-button';
    const buttons = document.querySelectorAll(query);
    const src = `${url}?${Date.now()}`;

    buttons.forEach(b => {
        if (b.getElementsByTagName('iframe').length < 1) {
            const bounds = b.getBoundingClientRect();
            const btnIframe = document.createElement('iframe');
            btnIframe.frameBorder = '0';
            btnIframe.width = `${Math.round(bounds.width)}px`;
            btnIframe.height = `${Math.round(bounds.height)}px`;
            btnIframe.style.position = 'absolute';
            btnIframe.style.top = '0px';
            btnIframe.style.left = '0px';
            btnIframe.style.zIndex = '1';
            // btnIframe.style.opacity = '0'; // this makes click impossible on cross-origin
            btnIframe.setAttribute('allow', 'usb');
            btnIframe.setAttribute('scrolling', 'no');
            btnIframe.src = src;

            // inject iframe into button
            b.append(btnIframe);
        }
    });
};

export default render;
