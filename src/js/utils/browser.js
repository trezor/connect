/* @flow */
'use strict';

import * as bowser from 'bowser';
import DataManager from '../data/DataManager';

type State = {
    name: string,
    osname: string,
    supported: boolean,
    outdated: boolean,
    mobile: boolean,
}

export const state: State = {
    name: 'unknown',
    osname: 'unknown',
    supported: false,
    outdated: false,
    mobile: false,
};

export const checkBrowser = (): State => {
    const supported = DataManager.getConfig().supportedBrowsers;
    state.name = `${bowser.name}: ${bowser.version}; ${bowser.osname}: ${bowser.osversion};`;
    state.mobile = bowser.mobile;
    state.osname = bowser.osname;
    if (bowser.mobile && typeof navigator.usb === 'undefined') {
        state.supported = false;
    } else {
        const isSupported: any = supported[ bowser.name.toLowerCase() ];
        if (isSupported) {
            state.supported = true;
            state.outdated = isSupported.version > parseInt(bowser.version, 10);
        }
    }

    return state;
};

// Parse JSON loaded from config.assets.bridge
// Find preferred platform using bowser and userAgent
export const parseBridgeJSON = (json: JSON): JSON => {
    const osname = bowser.osname.toLowerCase();
    let preferred: string = '';
    switch (osname) {
        case 'linux': {
            const agent = navigator.userAgent;
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
