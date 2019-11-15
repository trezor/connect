/* @flow */
import Bowser from 'bowser';

export type BrowserState = {
    name: string,
    osname: string,
    supported: boolean,
    outdated: boolean,
    mobile: boolean,
}

export const state: BrowserState = {
    name: 'unknown',
    osname: 'unknown',
    supported: false,
    outdated: false,
    mobile: false,
};

export type Browser = {
    version: number,
    download: string,
    update: string,
}

export const getBrowserState = (supportedBrowsers: { [key: string]: Browser }): BrowserState => {
    if (typeof window === 'undefined') return state;
    const { browser, os, platform } = Bowser.parse(window.navigator.userAgent);
    const mobile = platform.type !== 'desktop';
    let supported = !!supportedBrowsers[browser.name.toLowerCase()];
    let outdated = false;

    if (mobile && typeof navigator.usb === 'undefined') {
        supported = false;
    }
    if (supported) {
        const { version } = supportedBrowsers[browser.name.toLowerCase()];
        outdated = version > parseInt(browser.version, 10);
        supported = !outdated;
    }

    return {
        name: `${browser.name}: ${browser.version}; ${os.name}: ${os.version};`,
        osname: os.name,
        mobile,
        supported,
        outdated,
    };
};

// Parse JSON loaded from config.assets.bridge
export const parseBridgeJSON = (json: JSON): JSON => {
    let preferred: string = '';
    if (typeof window !== 'undefined') {
        // Find preferred platform using bowser and userAgent
        const agent = window.navigator.userAgent;
        const browser = Bowser.getParser(agent);
        const { name } = browser.getOS();
        switch (name) {
            case 'linux': {
                const isRpm = agent.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/) ? 'rpm' : 'deb';
                const is64x = agent.match(/Linux i[3456]86/) ? '32' : '64';
                preferred = `${isRpm}${is64x}`;
            }
                break;
            case 'macos':
                preferred = 'mac';
                break;
            case 'windows':
                preferred = 'win';
                break;
            default: break;
        }
    }

    // $FlowIssue indexer property is missing in `JSON`
    const latest = json[0];
    const version = latest.version.join('.');

    latest.packages = latest.packages.map(p => ({
        ...p,
        url: `${latest.directory}${p.url}`,
        signature: p.signature ? `${latest.directory}${p.signature}` : null,
        preferred: (p.platform.indexOf(preferred) >= 0),
    }));
    latest.changelog = latest.changelog.replace(/\n/g, '').split('* ');
    latest.changelog.splice(0, 1);
    return JSON.parse(JSON.stringify(latest).replace(/{version}/g, version));
};

export const isWebUsbAvailable = () => {
    if (typeof window === 'undefined') return false;
    const { browser } = Bowser.parse(window.navigator.userAgent);
    const browserName = browser.name.toLowerCase();
    if ((browserName === 'chrome' || browserName === 'chromium') && parseInt(browser.version, 10) >= 72) {
        return false;
    }
    return typeof window.navigator.usb !== 'undefined';
};
