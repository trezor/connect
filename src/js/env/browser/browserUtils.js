/* @flow */
import Bowser from 'bowser';
import { getBridgeInfo } from '../../data/TransportInfo';

export type BrowserState = {
    name: string;
    osname: string;
    supported: boolean;
    outdated: boolean;
    mobile: boolean;
}

export const state: BrowserState = {
    name: 'unknown',
    osname: 'unknown',
    supported: false,
    outdated: false,
    mobile: false,
};

type SupportedBrowser = {
    version: number;
    download: string;
    update: string;
};

export const getBrowserState = (supportedBrowsers: { [key: string]: SupportedBrowser }): BrowserState => {
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

const getSuggestedBridgeInstaller = () => {
    if (!navigator || !navigator.userAgent) return;
    // Find preferred platform using bowser and userAgent
    const agent = navigator.userAgent;
    const browser = Bowser.getParser(agent);
    const name = browser.getOS().name.toLowerCase();
    switch (name) {
        case 'linux': {
            const isRpm = agent.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/) ? 'rpm' : 'deb';
            const is64x = agent.match(/Linux i[3456]86/) ? '32' : '64';
            return `${isRpm}${is64x}`;
        }
        case 'macos':
            return 'mac';
        case 'windows':
            return 'win';
        default: break;
    }
};

export const suggestBridgeInstaller = () => {
    const info = getBridgeInfo();
    // check if preferred field was already added
    if (!info.packages.find(p => p.preferred)) {
        const preferred = getSuggestedBridgeInstaller();
        if (preferred) {
            // override BridgeInfo packages, add preferred field
            info.packages = info.packages.map(p => ({
                ...p,
                preferred: p.platform.indexOf(preferred) >= 0,
            }));
        }
    }
    return info;
};
