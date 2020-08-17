/* @flow */

// slight hack to make Flow happy, but to allow Node to set its own fetch
// Request, RequestOptions and Response are built-in types of Flow for fetch API
let _fetch: (input: string | Request, init?: RequestOptions) => Promise<Response> =
  typeof window === 'undefined'
      ? () => Promise.reject()
      : window.fetch;

export function setFetch(fetch: any) {
    _fetch = fetch;
}

type ProtoInstallerShort = {
    shortUrl: string;
    label: string;
    platform: string | Array<string>;
}

type ProtoInstaller = {
    url: string;
    label: string;
    platform: string | Array<string>;
}

export type BridgeInstaller = {
    version: string;
    url: string;
    label: string;
    platform: string | Array<string>;
    preferred: boolean;
};

export type UdevInstaller = {
    url: string;
    label: string;
    platform: string | Array<string>;
    preferred: boolean;
};

function fillInstallerUrl(installer: ProtoInstallerShort, domain: string): ProtoInstaller {
    return {
        url: domain + installer.shortUrl,
        label: installer.label,
        platform: installer.platform,
    };
}

const DATA_DOMAIN = 'https://mytrezor.s3.amazonaws.com';
const BRIDGE_VERSION_URL: string = DATA_DOMAIN + '/bridge/latest.txt';

const BRIDGE_INSTALLERS: Array<ProtoInstallerShort> = [{
    shortUrl: '/bridge/%version%/trezor-bridge-%version%-win32-install.exe',
    label: 'Windows',
    platform: ['win32', 'win64'],
}, {
    shortUrl: '/bridge/%version%/trezor-bridge-%version%.pkg',
    label: 'macOS',
    platform: 'mac',
}, {
    shortUrl: '/bridge/%version%/trezor-bridge_%version%_amd64.deb',
    label: 'Linux 64-bit (deb)',
    platform: 'deb64',
}, {
    shortUrl: '/bridge/%version%/trezor-bridge-%version%-1.x86_64.rpm',
    label: 'Linux 64-bit (rpm)',
    platform: 'rpm64',
}, {
    shortUrl: '/bridge/%version%/trezor-bridge_%version%_i386.deb',
    label: 'Linux 32-bit (deb)',
    platform: 'deb32',
}, {
    shortUrl: '/bridge/%version%/trezor-bridge-%version%-1.i386.rpm',
    label: 'Linux 32-bit (rpm)',
    platform: 'rpm32',
}];

const UDEV_INSTALLERS: Array<ProtoInstallerShort> = [{
    shortUrl: '/udev/trezor-udev-1-1.noarch.rpm',
    label: 'RPM package',
    platform: ['rpm32', 'rpm64'],
}, {
    shortUrl: '/udev/trezor-udev_1_all.deb',
    label: 'DEB package',
    platform: ['deb32', 'deb64'],
}];

type UdevOptions = {
    platform?: string;
    domain?: string;
};

export function udevInstallers(options: ?UdevOptions): Array<UdevInstaller> {
    const o: UdevOptions = options || {};
    const platform: string = o.platform || preferredPlatform();
    const domain: string = o.domain || DATA_DOMAIN;

    return UDEV_INSTALLERS
        .map(i => fillInstallerUrl(i, domain))
        .map(function (udev: ProtoInstaller): UdevInstaller {
            return {
                url: udev.url,
                label: udev.label,
                platform: udev.platform,
                preferred: isPreferred(udev.platform, platform),
            };
        });
}

type VersionOptions = {
    bridgeUrl?: string;
}

export function latestVersion(options: ?VersionOptions): Promise<string> {
    const o: VersionOptions = options || {};
    const bridgeUrl: string = o.bridgeUrl || BRIDGE_VERSION_URL;
    return _fetch(bridgeUrl)
        .then(response => {
            return response.ok
                ? response.text()
                : response.text().then((text) => Promise.reject(text));
        })
        .then(version_ => {
            if (typeof version_ !== 'string') {
                throw new Error('Wrong version load result.');
            }
            return version_.trim();
        });
}

type BridgeOptions = {
    platform?: string;
    version?: string;
    bridgeUrl?: string;
    domain?: string;
};

// Returns a list of bridge installers, with download URLs and a mark on
// bridge preferred for the user's platform.
export function installers(options: ?BridgeOptions): Promise<Array<BridgeInstaller>> {
    const o: BridgeOptions = options || {};
    const version: Promise<string> = Promise.resolve(o.version || latestVersion(options));
    return version.then(version => {
        const platform: string = o.platform || preferredPlatform();
        const domain: string = o.domain || DATA_DOMAIN;

        return BRIDGE_INSTALLERS
            .map(i => fillInstallerUrl(i, domain))
            .map(function (bridge: ProtoInstaller): BridgeInstaller {
                return {
                    version: version,
                    url: bridge.url.replace(/%version%/g, version),
                    label: bridge.label,
                    platform: bridge.platform,
                    preferred: isPreferred(bridge.platform, platform),
                };
            });
    });
}

function isPreferred(installer: string | Array<string>, platform: string): boolean {
    if (typeof installer === 'string') { // single platform
        return installer === platform;
    } else { // any of multiple platforms
        for (let i = 0; i < installer.length; i++) {
            if (installer[i] === platform) {
                return true;
            }
        }
        return false;
    }
}

function preferredPlatform(): string {
    const ver = navigator.userAgent;

    if (ver.match(/Win64|WOW64/)) return 'win64';
    if (ver.match(/Win/)) return 'win32';
    if (ver.match(/Mac/)) return 'mac';
    if (ver.match(/Linux i[3456]86/)) {
        return ver.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/)
            ? 'rpm32' : 'deb32';
    }
    if (ver.match(/Linux/)) {
        return ver.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/)
            ? 'rpm64' : 'deb64';
    }

    // fallback - weird OS
    // most likely windows, let's say 32 bit
    return 'win32';
}
